const Job = require("./job.model");
const Staff = require("../staff/staff.model");
const Application = require("./applications.model");
const {
  generateResponse,
  notFound,
} = require("../../middleware/responseHandler");

exports.doPostJob = async (req, res, next) => {
  try {
    let getResponse = "";
    if (req.role.toString() == "staff") {
      getResponse = await generateResponse(
        [],
        req.token,
        401,
        "You dont have Permission to Perform this Operation.."
      );
      return res.status(401).send(getResponse);
    }
    req.body.hospital = req.userId;
    let newJob = new Job(req.body);
    let result = await newJob.save();
    console.log(result);
    if (!result) {
      return res.status(500).send({
        data: [],
        Message: "Internal Server Error, Cannot Save Job",
      });
    }
    return res.status(200).send({
      data: result,
      Message: "Job Posted Successfully",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.doGetJob = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const result = await Job.findById({ _id, isDeleted: false }).populate({
      path: "hospital",
      select: "name email corporateAddress phone",
    });
    if (!result) {
      return res.status(404).send({
        data: [],
        Message: "No Such job Found, Cannot get Job",
      });
    }
    return res.status(200).send({
      data: result,
      Message: "Job Fetched Successfully",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};
exports.doDeleteJob = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const job = await Job.findById({ _id });
    if (!job) {
      return res.status(404).send({
        data: [],
        Message: "No Such job Found, Cannot Delete Job",
      });
    }
    if (job.isDeleted == true) {
      return res.status(500).send({
        data: [],
        Message: "Already Deleted, Cannot Delete Job",
      });
    }
    job.isDeleted = true;
    const result = await job.save();
    if (!result) {
      return res.status(404).send({
        data: [],
        Message: "No Such job Found, Cannot Delete Job",
      });
    }
    return res.status(200).send({
      data: result,
      Message: "Job Deleted Successfully",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.doUpdateJob = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const query = { _id };
    const update = { ...req.body };
    const result = await Job.findByIdAndUpdate(query, update, { new: true });
    if (!result) {
      return res.status(404).send({
        data: [],
        Message: "No Such job Found, Cannot Update Job",
      });
    }
    return res.status(200).send({
      data: result,
      Message: "Job Updated Successfully",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.doGetJobList = async (req, res, next) => {
  try {
    let getResponse = "";
    let { skip, sort } = req.query;
    skip = skip == undefined || "" ? 0 : skip;
    sort = sort == undefined || "" ? "desc" : sort;

    let result = await Job.find({ hospital: req.userId })
      .sort({ createdAt: sort })
      .skip(skip);
    if (result.length <= 0) {
      getResponse = await generateResponse(
        [],
        req.token,
        404,
        "No jobs posted by the user..."
      );
      return res.status(404).send(getResponse);
    }
    const count = await Job.countDocuments();
    result.unshift({ count });
    getResponse = await generateResponse(
      result,
      200,
      req.token,
      "Jobs Fetched Successfully..."
    );
    return res.status(200).send(getResponse);
  } catch (err) {
    next(err);
  }
};

exports.doGetJobListByName = async (req, res, next) => {
  try {
    let { sort, skip, jobTitle } = req.query;
    let getResponse = "";
    if (jobTitle == undefined || jobTitle == "") {
      getResponse = await generateResponse(
        [],

        req.token,
        500,
        "Job Title is Empty.."
      );
      return res.status(500).send(getResponse);
    }
    skip = skip == undefined || "" ? 0 : skip;
    sort = sort == undefined || "" ? "desc" : sort;
    let regex = new RegExp(jobTitle, "i");
    let result = await Job.find({ jobTitle: regex, hospital: req.userId })
      .sort({ createdAt: sort })
      .skip(parseInt(skip))
      .limit(10);
    if (result.length <= 0) {
      getResponse = await generateResponse(
        [],
        404,
        req.token,
        "No Such Job Found.."
      );
      return res.status(404).send(getResponse);
    }
    const count = await Job.countDocuments({ hospital: req.userId });
    result.unshift({ count });
    getResponse = await generateResponse(
      result,
      req.token,
      200,
      "Jobs Found.."
    );
    return res.status(200).send(getResponse);
  } catch (err) {
    next(err);
  }
};

exports.doApplyForJob = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const staff = req.userId;
    if (_id == undefined || _id == "") {
      getResponse = await generateResponse(
        [],
        req.token,
        500,
        "Missing Job Parameter.."
      );
      return res.status(500).send(getResponse);
    }
    let job = await Job.findById({ _id });
    if (job.length <= 0) {
      getResponse = await generateResponse(
        [],
        req.token,
        404,
        "No Such Job Found to Apply.."
      );
      return res.status(404).send(getResponse);
    }

    if (job.appliedBy.includes(staff)) {
      getResponse = await generateResponse(
        [],
        req.token,
        500,
        "Already Applied for this Job.."
      );
      return res.status(500).send(getResponse);
    }

    job.appliedBy.unshift(staff);
    const saveJob = await job.save();
    if (saveJob.length <= 0) {
      getResponse = await generateResponse(
        [],
        req.token,
        500,
        "Internal Server Error. Cannot Save Job.."
      );
      return res.status(500).send(getResponse);
    }
    let jobApplication = {
      hospital: job.hospital,
      staff,
      job: _id,
    };
    const application = new Application(jobApplication);
    await application.save();

    const user = await Staff.findById({ _id: staff });
    user.jobsApplied.unshift(_id);
    user.totalContracts.unshift(_id);
    let saveUser = await user.save();

    console.log(saveApp);

    if (saveUser.length <= 0) {
      getResponse = await generateResponse(
        [],
        500,
        req.token,
        "Internal Server Error. Cannot Update Staff profile/JobsApplied.."
      );
      return res.status(500).send(getResponse);
    }

    getResponse = await generateResponse(
      saveUser,
      200,
      req.token,
      "Your Job Application was Successful.."
    );
    return res.status(200).send(getResponse);
  } catch (err) {
    next(err);
  }
};

//*********************Getting Job applicants by Job********************************* */
exports.doGetJobApplicants = async (req, res, next) => {
  try {
    let { skip, sort } = req.query;
    skip = skip == undefined || "" ? 0 : skip;
    sort = sort == undefined || "" ? "desc" : sort;
    if (req.role.toString() == "staff") {
      getResponse = await generateResponse(
        [],
        401,
        req.token,
        "You don't have permission to perform this Operation"
      );
      return res.status(401).send(getResponse);
    }

    let { _id } = req.params;

    _id == undefined || ""
      ? generateResponse([], req.token, 400, "Job ID Not Found")
      : _id;

    const applicants = await Job.findById({ _id }).populate({
      path: "appliedBy",
      select:
        "ratings currentLocation name weekendAvailiblity immediatelyStart nursingLicense liabilityInsurance",
      options: {
        limit: 10,
        sort: { createdAt: sort },
        skip: parseInt(skip),
      },
    });

    if (applicants.length <= 0) {
      getResponse = await generateResponse(
        [],
        4040,
        req.token,
        "No applicants Found"
      );
      return res.status(500).send(getResponse);
    }

    const count = await Job.findById({ _id }).populate({
      path: "appliedBy",
      select:
        "ratings currentLocation name weekendAvailiblity immediatelyStart nursingLicense liabilityInsurance",
    });

    let data = [{ totalApplicants: count.appliedBy.length }, applicants];

    getResponse = await generateResponse(
      data,
      200,
      req.token,
      "Applicants Fetched Successfully.."
    );
    return res.status(200).send(getResponse);
  } catch (err) {
    next(err);
  }
};

//*********************Getting Job applicants by Time Commitment********************************* */
exports.doGetByCommitment = async (req, res, next) => {
  try {
    let { sort, skip, jobTitle, commitment } = req.query;

    console.log(req.query);
    let getResponse = "";
    if (jobTitle == undefined || jobTitle == "") {
      getResponse = await generateResponse(
        [],
        500,
        req.token,
        "Job Title is Empty.."
      );
      return res.status(500).send(getResponse);
    }
    skip = skip == undefined || "" ? 0 : skip;
    sort = sort == undefined || "" ? "desc" : sort;
    commitment = commitment == undefined || "" ? "Full Time" : commitment;

    let reg = new RegExp(jobTitle, "i");
    let result = await Job.find({ jobTitle: reg, hospital: req.userId })
      .sort({ createdAt: sort })
      .skip(parseInt(skip))
      .limit(10);
    if (result.length <= 0) {
      getResponse = await generateResponse(
        [],
        req.token,
        404,
        "No Such Job Found.."
      );
      return res.status(404).send(getResponse);
    }

    const count = await Job.countDocuments({ hospital: req.userId });
    console.log(count);
    result.unshift({ count });
    getResponse = await generateResponse(
      result,
      req.token,
      200,
      "Jobs Found.."
    );
    return res.status(200).send(getResponse);
  } catch (err) {
    next(err);
  }
};

//*********************Getting Job applicants by Status = inprogress/hired********************************* */

exports.doGetByStatus = async (req, res, next) => {
  try {
    let { sort, skip, jobTitle, filter, on } = req.query;

    skip = skip == undefined || "" ? 0 : skip;
    sort = sort == undefined || "" ? "desc" : sort;
    on = on == undefined || "" ? "Name" : on;
    filter = filter == undefined || "" ? "Full Time" : filter;

    let getResponse = "";
    if (jobTitle == undefined || jobTitle == "") {
      getResponse = await generateResponse(
        [],
        500,
        req.token,
        "Job Title is Empty.."
      );
      return res.status(500).send(getResponse);
    }

    if (on == "Name") {
      let reg = new RegExp(jobTitle, "i");
      let result = await Application.find({
        staff: reg,
        hospital: req.userId,
        status: "Review",
      })
        .sort({ createdAt: sort })
        .skip(parseInt(skip))
        .limit(10);
    }
  } catch (err) {
    next(err);
  }
};
