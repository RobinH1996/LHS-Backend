const router = require("express").Router();
const _service = require("./service");

router.post("/save/:check", _service.doSave);
/* router.patch("/editEducation/:_id", _staffService.doLogin);
router.get("/getAllEducation", _staffService.doGetUserById);
router.delete("/deleteEducation/:_id", _staffService.doDeleteUserById);

 */

module.exports = router;
