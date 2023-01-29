const Hospital = require("./hospital.model");
const { generateResponse } = require("../../middleware/responseHandler");
const Staff = require("../staff/staff.model");
const bcrypt = require("bcrypt");

exports.emailCheck = async (req, res, next) => {
  try {
    const result = await Hospital.find({ email: req.body.email });
    if (!result.length) {
      return res.status(200).send({
        data: [],
        result: "OK",
        token: [],
      });
    } else {
      return res.status(200).send({
        data: result.length,
        result: "REPEAT",
        token: [],
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.doSignup = async (req, res, next) => {
  try {
    const hospital = new Hospital(req.body);
    const result = await hospital.save();
    // const token = await hospital.generateAuthToken();

    if (!result) {
      return res.status(500).send({
        data: [],
        Message: "Cannot Save User",
        token: [],
      });
    }
    result["tokens"] = null;
    result["password"] = null;
    return res.status(200).send({
      data: result,
      Message: "User Created Successfully",
      token: [],
    });
  } catch (err) {
    next(err);
  }
};

exports.doLogin = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByCredentials(
      req.body.email,
      req.body.password
    );
    console.log(hospital);
    let getResponse = "";

    if (hospital == 404) {
      getResponse = await generateResponse(
        [],
        "",
        hospital,
        "No Such User Found...."
      );
      return res.status(getResponse.status).send(getResponse);
    }
    if (hospital == 406) {
      getResponse = await generateResponse(
        [],
        "",
        hospital,
        "You have Entered Wrong Password...."
      );
      return res.status(getResponse.status).send(getResponse);
    }
    if (hospital == 500) {
      getResponse = await generateResponse(
        [],
        "",
        hospital,
        "Internal Server Error...."
      );
      return res.status(getResponse.status).send(getResponse);
    }

    console.log(hospital);
    const token = await hospital.generateAuthToken();

    if (!token) {
      getResponse = await generateResponse(
        [],
        "",
        hospital,
        "Internal Server Error/Unable to Create Token...."
      );
      return res.status(500).send(getResponse);
    }

    getResponse = await generateResponse(
      hospital,
      token,
      200,
      "Login Successful."
    );
    return res.status(200).send(getResponse);
  } catch (err) {
    next(err);
  }
};

exports.doGetUserById = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const user = await Hospital.findById({ _id }).lean();
    if (!user) {
      return res.status(500).send({
        data: [],
        Message: "Something went Wrong..",
        token: "",
      });
    }
    return res.status(200).send({
      data: user,
      Message: "User Fetched Successfully",
      token: req.token,
    });
  } catch (err) {
    next(err);
  }
};

exports.doUpdateUserById = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const query = { _id };
    const update = { ...req.body };
    if (update.password) {
      update.password = await bcrypt.hash(
        update.password,
        parseInt(process.env.ROUNDS)
      );
    }
    const result = await Hospital.findByIdAndUpdate(query, update, {
      new: true,
    });

    if (!result) {
      return res.status(500).send({
        data: [],
        Message: "Cannot Update user..",
        token: [],
      });
    }
    // const token = await result.generateAuthToken();
    result["tokens"] = null;
    result["password"] = null;
    return res.status(200).send({
      data: result,
      Message: "User Updated Successfully",
      token: req.token,
    });
  } catch (err) {
    next(err);
  }
};

exports.doGetDashboard = async (req, res, next) => {
  try {
    const _id = req.userId;
    const result = await Hospital.findById({ _id }).lean();
    let getResponse = "";
    if (!result) {
      getResponse = await generateResponse(
        [],
        "",
        404,
        "Unable to fetch Dashboard Details/User Not Found...."
      );
      return res.status(500).send(getResponse);
    }
    delete result.password;
    delete result.tokens;
    getResponse = await generateResponse(
      result,
      req.token,
      200,
      "Details Fetched Successfully...."
    );
    return res.status(200).send(getResponse);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//********************SETTING UP FILETERS FOR GENERAL JOB LISTING*****/
exports.doGetGeneralStaffList = async (req, res, next) => {
  console.log("------------Do Get GeneralStaffList  ok-------------");
  console.log(req.query);
  try {
    const { skip, sort } = req.query;
    const staff = await Staff.find({})
      .sort({ name: sort })
      .skip(parseInt(skip))
      .limit(10);
    if (staff.length <= 0) {
      getResponse = await generateResponse(
        [],
        req.token,
        404,
        "Cannot fetch Staff...."
      );
      console.log("404 Error")
      return res.status(404).send(getResponse);
    }

    const count = await Staff.countDocuments();
    staff.unshift({ count });
    getResponse = await generateResponse(
      staff,
      req.token,
      200,
      "Staff Fetched Successfully...."
    );
    console.log("200");
    return res.status(200).send(getResponse);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

//************************GET HELPER FUNCTION **************************** */
const setFilter = async (filter, value) => {
  let searchQuery = {};
  if (filter == "" || filter == undefined) {
    searchQuery.weekendAvailiblity = true;
    return searchQuery;
  }

  if (filter == "weekendAvailiblity") {
    searchQuery.weekendAvailiblity = value == undefined || "" ? true : value;
    return searchQuery;
  }

  if (filter == "Commitment") {
    searchQuery.workSchedule = value == undefined || "" ? "Full Time" : value;
    return searchQuery;
  }
  if (filter == "medicalSettings") {
    searchQuery.medicalSettings =
      value == undefined || "" ? "Urgent Care Centers" : value;
    return searchQuery;
  }
};
//********************SETTING UP FILTERS FOR SEARCH BY NAME :JOB LISTING*****/
exports.doGetStaffByName = async (req, res, next) => {
  console.log("------------------start Staff by Name------------------");
  try {
    let { name, skip, sort, sortValue, filter, value } = req.query;
    skip = skip == undefined || "" ? 0 : skip;
    sort = sort == undefined || "" ? "ratings.ratingSum" : sort;

    if (sort == "rating" || "ratings.ratingSum") {
      var sortObject = {
        "ratings.ratingSum": parseInt(sortValue),
      };
    }

    if (sort == "availability" && sortValue.toLowerCase() == "true") {
      var sortObject = {
        immediatelyStart: -1,
      };
    }

    if (sort == "availability" && sortValue.toLowerCase() == "false") {
      var sortObject = {
        immediatelyStart: 1,
      };
    }

    filter = await setFilter(filter, value);
    const regex = new RegExp(name, "i");
    const staff = await Staff.find({
      $and: [
        {
          $or: [
            { weekendAvailiblity: filter.weekendAvailiblity },
            { workSchedule: filter.workSchedule },
            { medicalSettings: filter.medicalSettings },
          ],
        },

        { name: regex },
      ],
    })
      .sort(sortObject)
      .skip(parseInt(skip))
      .limit(10);

    if (staff.length <= 0) {
      getResponse = await generateResponse(
        [],
        req.token,
        404,
        "Cannot fetch Staff...."
      );
      return res.status(404).send(getResponse);
    }
    const count = await Staff.find({
      $and: [
        {
          $or: [
            { weekendAvailiblity: filter.weekendAvailiblity },
            { workSchedule: filter.workSchedule },
            { medicalSettings: filter.medicalSettings },
          ],
        },

        { name: regex },
      ],
    });

    staff.unshift({ count: count.length });
    getResponse = await generateResponse(
      staff,
      req.token,
      200,
      "Staff Fetched Successfully...."
    );
    console.log(getResponse);
    return res.status(200).send(getResponse);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

//********************SETTING UP FILETERS FOR SEARCH BY Education Title :JOB LISTING*****/
exports.doGetStaffByEducation = async (req, res, next) => {
  console.log("------------ start Staff by Education -----------");
  try {
    let { education, skip, sort, filter, value, sortValue } = req.query;
    if (education === undefined || education === "") {
      getResponse = await generateResponse(
        [],
        req.token,
        500,
        "Error in Query, Education String is required.."
      );
      return res.status(500).send(getResponse);
    }

    skip = skip == undefined || "" ? 0 : skip;
    sort = sort == undefined || "" ? "ratings.ratingSum" : sort;

    if (sort == "rating" || "ratings.ratingSum") {
      var sortObject = {
        "ratings.ratingSum": parseInt(sortValue),
      };
    }

    if (sort == "availability" && sortValue.toLowerCase() == "true") {
      var sortObject = {
        immediatelyStart: -1,
      };
    }

    if (sort == "availability" && sortValue.toLowerCase() == "false") {
      var sortObject = {
        immediatelyStart: 1,
      };
    }

    filter = await setFilter(filter, value);
    const regex = new RegExp(education, "i");
    console.log(filter);
    const staff = await Staff.find({
      $and: [
        {
          $or: [
            { weekendAvailiblity: filter.weekendAvailiblity },
            { workSchedule: filter.workSchedule },
            { medicalSettings: filter.medicalSettings },
          ],
        },

        { "education.degree": regex },
      ],
    })
      .sort(sortObject)
      .skip(parseInt(skip))
      .limit(10);

    if (staff.length <= 0) {
      getResponse = await generateResponse(
        [],
        req.token,
        404,
        "Cannot fetch Staff...."
      );
      return res.status(404).send(getResponse);
    }
    const count = await Staff.countDocuments({
      $and: [
        {
          $or: [
            { weekendAvailiblity: filter.weekendAvailiblity },
            { workSchedule: filter.workSchedule },
            { medicalSettings: filter.medicalSettings },
          ],
        },

        { "education.degree": regex },
      ],
    });
    staff.unshift({ count });
    getResponse = await generateResponse(
      staff,
      req.token,
      200,
      "Staff Fetched Successfully...."
    );
    return res.status(200).send(getResponse);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

//********************SETTING UP FILETERS FOR SEARCH BY Certification  :JOB LISTING*****/
exports.doGetStaffByCertification = async (req, res, next) => {
  try {
    let { certification, skip, sort, sortValue, filter, value } = req.query;
    console.log(sort);
    if (certification === undefined || certification === "") {
      getResponse = await generateResponse(
        [],
        req.token,
        500,
        "Error in Query, Education String is required.."
      );
      return res.status(500).send(getResponse);
    }

    skip = skip == undefined || "" ? 0 : skip;
    sort = sort == undefined || "" ? "ratings.ratingSum" : sort;

    if (sort == "rating" || "ratings.ratingSum") {
      var sortObject = {
        "ratings.ratingSum": parseInt(sortValue),
      };
    }

    if (sort == "availability" && sortValue.toLowerCase() == "true") {
      var sortObject = {
        immediatelyStart: -1,
      };
    }

    if (sort == "availability" && sortValue.toLowerCase() == "false") {
      var sortObject = {
        immediatelyStart: 1,
      };
    }
    filter = await setFilter(filter, value);
    const regex = new RegExp(certification, "i");
    const staff = await Staff.find({
      "certifications.name": regex,
    })
      .sort(sortObject)
      .skip(parseInt(skip))
      .limit(10);

    if (staff.length <= 0) {
      getResponse = await generateResponse(
        [],
        req.token,
        404,
        "Cannot fetch Staff. Nothing found with such certification...."
      );
      return res.status(404).send(getResponse);
    }
    const count = await Staff.countDocuments({
      "certifications.name": regex,
    });
    let data = [{ count }, ...staff];
    getResponse = await generateResponse(
      data,
      req.token,
      200,
      "Staff Fetched Successfully...."
    );
    return res.status(200).send(getResponse);
  } catch (err) {
    next(err);
  }
};

exports.getByQuery = async (req, res, next) => {
  try {
    console.log(req.body);
    const name = req.body.name;
    const email = req.body.email;

    const sortByName = req.body.sortByName;
    const curPage = req.body.curPage;
    var skip = 5 * (curPage - 1);
    var query = Hospital.find();
    query.where({ email: { $regex: email, $options: "i" } });
    query.where({ name: { $regex: name, $options: "i" } });
    query.collation({ locale: "en" });
    query.sort({ name: sortByName });
    query.skip(skip).limit(5);
    var result = await query.exec();
    var total = await Hospital.count();
    var data = {
      total: total,
      hospitals: result,
    };
    return res.status(200).send({
      data: data,
      Message: "Successfully Get Staffs",
      token: req.token,
    });
  } catch (err) {
    next(err);
  }
};
