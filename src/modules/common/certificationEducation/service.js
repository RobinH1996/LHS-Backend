const Education = require("./education.model");
const Certification = require("./certification.model");

exports.doSave = async (req, res, next) => {
  try {
    const { check } = req.params;
    const education = "Education";
    const certification = "Certification";
    let result = "";
    if (check.toLowerCase() == certification.toLowerCase()) {
      const certificate = new Certification(req.body);
      result = await certificate.save();
    } else if (check.toLowerCase() == education.toLowerCase()) {
      const education = new Education(req.body);
      result = await education.save();
    }

    if (!result) {
      return res.status(500).send({ Message: "Unable to Create", data: [] });
    }
    return res.status(201).send({ Message: "Created", data: result });
  } catch (err) {
    next(err);
  }
};
