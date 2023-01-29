const Mongoose = require("mongoose");
const CertificationsSchema = new Mongoose.Schema(
  {
    certificationName: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = Certification = Mongoose.model(
  "Certification",
  CertificationsSchema
);
