const router = require("express").Router();
const _jobService = require("./job.service");
const auth = require("../../middleware/auth");

router.post("/add", auth, _jobService.doPostJob);
router.get("/get/:_id", auth, _jobService.doGetJob);
router.delete("/delete/:_id", auth, _jobService.doDeleteJob);
router.patch("/update/:_id", auth, _jobService.doUpdateJob);
router.get("/getList", auth, _jobService.doGetJobList);
router.get("/getByName", auth, _jobService.doGetJobListByName);
router.post("/apply/:_id", auth, _jobService.doApplyForJob);
router.get("/jobApplicants/:_id", auth, _jobService.doGetJobApplicants);
router.get("/getByCommitment", auth, _jobService.doGetByCommitment);

router.get("/getByStatus", auth, _jobService.doGetByStatus);

module.exports = router;
