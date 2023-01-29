const Rating = require("./rating.model");
const Staff = require("../staff/staff.model");
const Hospital = require("../hospital/hospital.model");
const { generateResponse } = require("../../middleware/responseHandler");
const { generateRating } = require("../../middleware/ratingHandler");

exports.doUserRating = async (req, res, next) => {
  try {
    let getResponse = "";
    const { rating, review, ratingTo } = req.body;
    const ratingBy = req.userId;
    const { role } = req.user;

    if (
      rating === undefined ||
      ratingTo === undefined ||
      rating == "" ||
      ratingTo == "" ||
      ratingTo == ratingBy
    ) {
      getResponse = await generateResponse(
        [],
        req.token,
        500,
        "Error in Query, Desired Data is not Available to Process.."
      );
      return res.status(500).send(getResponse);
    }
    if (ratingTo == ratingBy) {
      getResponse = await generateResponse(
        [],
        req.token,
        500,
        "You cannot Rate yourself.."
      );
      return res.status(500).send(getResponse);
    }

    let user = "";
    let rateTo = "";
    if (role === "staff") {
      user = await Hospital.findById({ _id: ratingTo });
      rateTo = "hospital";
    }
    if (role == "hospital") {
      user = await Staff.findById({ _id: ratingTo });
      rateTo = "staff";
    }
    if (user == "" || user == null) {
      getResponse = await generateResponse(
        [],
        req.token,
        404,
        "No Such Staff/Hospital Found to rate..."
      );
      return res.status(500).send(getResponse);
    }

    let sumRating = user.ratings.ratingSum;
    sumRating += rating;
    console.log(sumRating);
    sumRating = sumRating / 5;
    console.log(sumRating);
    user.ratings.ratingSum = sumRating;
    user.ratings.totalRatings++;
    const result = await user.save();

    const insertRating = new Rating({
      staff: role.toString() == "staff" ? ratingBy : result._id,
      hospital: role.toString() == "hospital" ? ratingBy : result._id,
      rating,
      review,
      ratingTo: rateTo,
    });
    let saveRating = await insertRating.save();
    if (!result && !saveRating) {
      getResponse = await generateResponse(
        [],
        req.token,
        500,
        "Internal Server Error, Unable to save Ratings..."
      );
      return res.status(500).send(getResponse);
    }

    getResponse = await generateResponse(
      saveRating,
      req.token,
      200,
      "Rating Saved Successfully..."
    );
    return res.status(200).send(getResponse);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.doGetStaffRating = async (req, res, next) => {
  try {
    const { _id } = req.params;
    let getResponse = "";
    if (_id === undefined || _id === "") {
      getResponse = await generateResponse(
        [],
        req.token,
        500,
        "Error in Query, Staff ID not passed.."
      );
      return res.status(500).send(getResponse);
    }

    const result = await Rating.find({
      staff: _id,
      ratingTo: "staff",
    })
      .select("hospital rating review")
      .populate({
        path: "hospital",
        select: "name email ratings role",
      });

    if (result.length < 0) {
      getResponse = await generateResponse(
        [],
        req.token,
        404,
        "No Ratings Found..."
      );
      return res.status(404).send(getResponse);
    }
    getResponse = await generateResponse(
      result,
      req.token,
      200,
      "Data Fetched Successfully..."
    );
    return res.status(200).send(getResponse);
  } catch (err) {
    next(err);
  }
};

exports.doGetHospitalRating = async (req, res, next) => {
  try {
    const { _id } = req.params;
    let getResponse = "";
    if (_id === undefined || _id === "") {
      getResponse = await generateResponse(
        [],
        req.token,
        500,
        "Error in Query, Hospital ID not Passed.."
      );
      return res.status(500).send(getResponse);
    }

    const result = await Rating.find({
      hospital: _id,
      ratingTo: "hospital",
    })
      .select("staff rating review")
      .populate({
        path: "staff",
        select: "name email ratings role",
      });

    if (result.length < 0) {
      getResponse = await generateResponse(
        [],
        req.token,
        404,
        "No Ratings Found..."
      );
      return res.status(404).send(getResponse);
    }
    getResponse = await generateResponse(
      result,
      req.token,
      200,
      "Data Fetched Successfully..."
    );
    return res.status(200).send(getResponse);
  } catch (err) {
    next(err);
  }
};
