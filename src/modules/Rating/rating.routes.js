const _ratingService = require("./rating.service");
const router = require("express").Router();
const auth = require("../../middleware/auth");

router.post("/save", auth, _ratingService.doUserRating);
router.get("/getStaffRating/:_id", auth, _ratingService.doGetStaffRating);
router.get("/getHospitalRating/:_id", auth, _ratingService.doGetHospitalRating);

module.exports = router;
