const Mongoose = require("mongoose");
const Hospital = require("../hospital/hospital.model");

const applicationsSchema = new Mongoose.Schema(
  {
    staff: {
      type: Mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    hospital: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "Hospitals",
      required: true,
    },
    jobAccepted: {
      type: Boolean,
      required: true,
      default: false,
    },
    job: {
      type: Mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Job",
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    startDate: {
      type: String,
      trim: true,
      default: " ",
    },
    endDate: {
      type: String,
      trim: true,
      default: " ",
    },
    status: {
      type: String,
      trim: true,
      default: "Applied",
    },
    responsibilities: {
      type: String,
      trim: true,
      default: " ",
    },
    isJobRejected: {
      type: Boolean,
      default: false,
    },
    rejectionReason: {
      type: String,
      default: " ",
    },
  },
  { timestamps: true }
);

applicationsSchema.pre("save", async function (next) {
  const job = this;
  /*  if (!job.positionsAvailable) {
    job.positionsAvailable = job.openPositions;
    let hospital = await Hospital.findOne({ _id: job.hospital });
    hospital.openPositions += job.positionsAvailable;
    hospital.totalContracts += job.positionsAvailable;
    hospital.activeContracts += job.positionsAvailable;
    await hospital.save();
  } */
  next();
});

module.exports = Application = Mongoose.model(
  "Applications",
  applicationsSchema
);
