const Mongoose = require("mongoose");
const Hospital = require("../hospital/hospital.model");

const jobSchema = new Mongoose.Schema(
  {
    hospital: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "Hospitals",
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },

    healthCareLocation: {
      type: String,
      required: true,
      trim: true,
    },
    jobTitle: {
      type: String,
      trim: true,
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
      trim: true,
    },
    medicalSetting: [{ type: String, trim: true }],

    contractType: {
      type: String,
      required: true,
      trim: true,
      enum: ["Permanent Position", "Temporary Position"],
    },

    timeCommitment: {
      type: String,
      required: true,
      trim: true,
    },
    weekendAvailiblity: {
      type: Boolean,
      required: true,
      default: false,
    },

    contractLength: {
      duration: {
        type: String,
        required: true,
        default: false,
      },
      length: {
        type: String,
        required: true,
      },
    },
    expectedStartDate: {
      type: String,
      trim: true,
    },
    openPositions: {
      type: Number,
      trim: true,
    },
    status: {
      type: String,
      default: "Review",
      trim: true,
    },
    positionsAvailable: {
      type: Number,
      default: 0,
      trim: true,
    },
    positionsFilled: {
      type: Number,
      default: 0,
      trim: true,
    },
    appliedBy: [
      {
        type: Mongoose.Schema.Types.ObjectId,
        required: true,
        trim: true,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

jobSchema.pre("save", async function (next) {
  const job = this;
  if (!job.positionsAvailable) {
    job.positionsAvailable = job.openPositions;
    let hospital = await Hospital.findOne({ _id: job.hospital });
    hospital.openPositions += job.positionsAvailable;
    hospital.totalContracts += job.positionsAvailable;
    hospital.activeContracts += job.positionsAvailable;
    await hospital.save();
  }
  next();
});

module.exports = Job = Mongoose.model("Job", jobSchema);
