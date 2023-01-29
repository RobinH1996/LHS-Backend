const jwt = require("jsonwebtoken");
const StaffUser = require("../modules/staff/staff.model");
const HospitalUser = require("../modules/hospital/hospital.model");
const AdminUser = require("../modules/admin/admin.model");

const auth = async (req, res, next) => {
  try {
    let token = req.header("Authorization").split("Bearer ");
    const decoded = jwt.verify(token[1], process.env.JWT_SECRET);
    let role = decoded.role;
    req.role = role;
    req.userId = decoded._id;
    let user;
    if (role === "hospital") {
      user = await HospitalUser.findOne({
        _id: decoded._id,
      });
    } else if (role === "staff") {
      user = await StaffUser.findOne({
        _id: decoded._id,
      });
    } else if (role === "admin") {
      user = await AdminUser.findOne({
        _id: decoded._id,
      });
    }

    if (!user) {
      return res
        .status(404)
        .send({ error: "No Such User Found/Invalid Token." });
    }
    // req.token = await user.generateAuthToken();
    req.token = token[1];
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

module.exports = auth;
