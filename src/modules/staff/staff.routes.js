const router = require("express").Router();
const auth = require("../../middleware/auth");
const _staffService = require("./staff.service");

router.post("/signup", _staffService.doSignup);
router.post("/login", _staffService.doLogin);
router.post("/emailCheck", _staffService.emailCheck);
router.get("/getById/:_id", auth, _staffService.doGetUserById);
router.post("/update/:_id", auth, _staffService.doUpdateUserById);
router.post("/getByQuery", auth, _staffService.getByQuery);
router.delete("/delete/:_id", auth, _staffService.doDeleteUserById);
router.get("/dashboard", auth, _staffService.doGetDashboard);

module.exports = router;
