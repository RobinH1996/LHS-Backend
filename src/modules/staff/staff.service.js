const Staff = require("./staff.model");
const { generateResponse } = require("../../middleware/responseHandler");
const bcrypt = require("bcrypt");

exports.emailCheck = async (req, res, next) => {
  try {
    const result = await Staff.find({ email: req.body.email });
    if (!result.length) {
      return res.status(200).send({
        data: [],
        result: "OK",
        token: [],
      });
    } else {
      return res.status(200).send({
        data: [],
        result: "REPEAT",
        token: [],
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.doSignup = async (req, res, next) => {
  console.log("-------------staff signup start-------------------");
  console.log(req.body.nursingLicence);
  try {
    const user = new Staff(req.body);
    console.log(user);
    const result = await user.save();
    if (!result) {
      return res.status(500).send({
        data: [],
        Message: "Cannot Save Staff",
        token: [],
      });
    }
    const token = await user.generateAuthToken();
    return res.status(200).send({
      data: result,
      Message: "Staff Created Successfully",
      token: token,
    });
  } catch (err) {
    next(err);
  }
};

exports.doLogin = async (req, res, next) => {
  try {
    const user = await Staff.findByCredentials(
      req.body.email,
      req.body.password
    );
    console.log("--------login start-----------");
    console.log(user);

    if (user !== "Password Error") {
      let token = await user.generateAuthToken();
      if (!user && !token) {
        console.log("------------pass------------");
        return res.status(500).send({
          data: [],
          Message: "Something went Wrong..",
          token: [],
        });
      }
      return res.status(200).send({
        data: user,
        Message: "Logged in Successfully",
        token: token,
      });
    } else {
      return res.status(200).send({
        data: [],
        Message: "Password Error",
        token: [],
      });
    }
  } catch (err) {
    next(err);
    console.log(err);
  }
};

exports.doGetUserById = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const user = await Staff.findById({ _id }).lean();
    delete user["password"];
    delete user["token"];
    if (!user) {
      return res.status(500).send({
        data: [],
        Message: "Something went Wrong..",
        token: "",
      });
    }
    return res.status(200).send({
      data: user,
      Message: "Staff Fetched Successfully",
      token: req.token,
    });
  } catch (err) {
    next(err);
  }
};

exports.doUpdateUserById = async (req, res, next) => {
  console.log("====================================="+req.body);
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
    const result = await Staff.findByIdAndUpdate(query, update, {
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
    result["password"] = null;
    result["token"] = null;
    return res.status(200).send({
      data: result,
      Message: "Staff Updated Successfully",
      token: req.token,
    });
  } catch (err) {
    next(err);
  }
};

exports.doGetDashboard = async (req, res, next) => {
  try {
    if (req.role.toString() == "hospital") {
      getResponse = await generateResponse(
        [],
        req.token,
        401,
        "You dont have Specific permissions to access."
      );
      return res.status(404).send(getResponse);
    }

    let getResponse = "";
    let dashboard = {
      totalContracts: "",
      contractsCompleted: "",
      activeContracts: "",
      jobsApplied: "",
      jobsOffers: "",
    };
    const result = await Staff.findById({ _id: req.userId })
      .select(
        "totalContracts contractsCompleted activeContracts jobsApplied jobsOffers"
      )
      .lean();
    if (!result) {
      getResponse = await generateResponse(
        [],
        req.token,
        404,
        "Cannot fetch Dashboard. Nothing found to fetch....."
      );
      return res.status(404).send(getResponse);
    }

    dashboard.totalContracts = result.totalContracts.length;
    dashboard.contractsCompleted = result.contractsCompleted.length;
    dashboard.activeContracts = result.activeContracts.length;
    dashboard.jobsApplied = result.jobsApplied.length;
    dashboard.jobsOffers = result.jobsOffers.length;
    getResponse = await generateResponse(
      dashboard,
      req.token,
      200,
      "Dashboard Fetched  Successfully"
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
    var query = Staff.find();
    query.where({ email: { $regex: email, $options: "i" } });
    query.where({ name: { $regex: name, $options: "i" } });
    query.collation({ locale: "en" });
    query.sort({ name: sortByName });
    query.skip(skip).limit(5);
    var result = await query.exec();
    var total = await Staff.count();
    var data = {
      total: total,
      staffs: result,
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

exports.doDeleteUserById = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const query = { _id };
    const update = { ...req.body };
    const result = await Staff.findByIdAndUpdate(query, update, {
      new: true,
    });
    return res.status(200).send({
      data: result,
      Message: "Successfully Get Staffs",
      token: req.token,
    });
  } catch (err) {
    next(err);
  }
};
