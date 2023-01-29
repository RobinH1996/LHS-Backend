const Agreement = require("./agreement.model");
const { generateResponse } = require("../../middleware/responseHandler");
exports.doSaveAgreement = async (req, res, next) => {
  try {
    let getResponse = "";
    if (Object.keys(req.body).length == 0) {
      getResponse = await generateResponse(
        [],
        "",
        500,
        "Request Body Not Found... "
      );
      return res.status(500).send(getResponse);
    }

    const agreement = new Agreement(req.body);
    const result = await agreement.save();

    if (result.length <= 0) {
      getResponse = await generateResponse(
        [],
        "",
        500,
        "Unable to Save the Agreement... "
      );
      return res.status(500).send(getResponse);
    }

    getResponse = await generateResponse(
      result,
      "",
      200,
      "Agreement Saved successfully... "
    );
    return res.status(200).send(getResponse);
  } catch (err) {
    next(err);
  }
};

exports.doGetAgreement = async (req, res, next) => {
  try {
    const agreement = await Agreement.find().sort({ createdAt: -1 }).limit(1);

    if (agreement.length <= 0) {
      getResponse = await generateResponse(
        [],
        "",
        500,
        "Unable to Get the Agreement... "
      );
      return res.status(500).send(getResponse);
    }
    getResponse = await generateResponse(
      agreement,
      "",
      200,
      "Agreement fetched successfully... "
    );
    return res.status(200).send(getResponse);
  } catch (err) {
    next(err);
  }
};
