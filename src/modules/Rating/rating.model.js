const mongoose = require("mongoose");
const ratingSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Hospitals",
  },
  rating: { type: Number, required: true, default: 0 },
  review: { type: String, required: true, default: "" },
  ratingTo: { type: String, required: true },
});

module.exports = Rating = mongoose.model("Ratings", ratingSchema);
