const router = require("express").Router();
const auth = require("../../middleware/auth");
const _hospitalService = require("./hospital.service");

router.post("/signup", _hospitalService.doSignup);
router.post("/login", _hospitalService.doLogin);
router.post("/emailCheck", _hospitalService.emailCheck);
router.post("/getByQuery", auth, _hospitalService.getByQuery);
router.post("/update/:_id", auth, _hospitalService.doUpdateUserById);
router.get("/getById/:_id", auth, _hospitalService.doGetUserById);
router.get("/dashboard", auth, _hospitalService.doGetDashboard);
router.get("/generalJobList", auth, _hospitalService.doGetGeneralStaffList);
router.get("/staffByName", auth, _hospitalService.doGetStaffByName);
router.get("/staffByEducation", auth, _hospitalService.doGetStaffByEducation);
router.get(
  "/staffByCertification",
  auth,
  _hospitalService.doGetStaffByCertification
);
module.exports = router;
