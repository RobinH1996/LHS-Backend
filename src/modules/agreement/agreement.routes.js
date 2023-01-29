const router = require("express").Router();
const _agreementService = require("./agreement.service");

router.post("/save", _agreementService.doSaveAgreement);
router.get("/get", _agreementService.doGetAgreement);

module.exports = router;
