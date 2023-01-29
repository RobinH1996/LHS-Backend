const mongoose = require("mongoose");

const agreementSchema = new mongoose.Schema(
  {
    agreement: { type: String, required: true, trim: true },
    idDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
module.exports = Agreement = mongoose.model("Agreement", agreementSchema);
