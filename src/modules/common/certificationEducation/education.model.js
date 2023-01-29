const Mongoose = require("mongoose");
const educationSchema = new Mongoose.Schema(
  {
    degree: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = Education = Mongoose.model("Education", educationSchema);
