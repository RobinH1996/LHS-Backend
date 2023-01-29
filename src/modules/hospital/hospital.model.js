const Mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const hospitalSchema = new Mongoose.Schema({
  ratings: {
    totalRatings: { type: Number, trim: true, default: 0 },
    ratingSum: { type: Number, trim: true, default: 0 },
  },
  idDeleted: { type: Boolean, default: false },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: { type: String, default: "hospital" },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid..");
      }
    },
  },
  avatar: {
    type: String,
    default: "",
  },
  badge: {
    type: Boolean,
    default: true,
  },
  hiringRole: { type: String, trim: true },
  healthCareInstitution: {
    name: { type: String, trim: true },
    size: { type: String, trim: true },
    website: { type: String, trim: true },
  },

  corporateAddress: [
    {
      zipCode: { type: String, trim: true },
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
    },
  ],

  password: {
    type: String,
    required: true,
    minlength: 6,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error('Password cannot contain "Password"');
      }
    },
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },

  agreement: {
    text: { type: String, trim: true },
    signedOn: {
      type: Date,
      default: Date.now,
    },
  },

  activeContracts: { type: Number, default: 0, trim: true },
  contractsCompleted: { type: Number, default: 0, trim: true },
  totalContracts: { type: Number, default: 0, trim: true },
  openPositions: { type: Number, default: 0, trim: true },
  totalApplicants: { type: Number, default: 0, trim: true },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});
//********RETURN THE JSON OBJECT WITHOUT SENSITIVE DATA**************** */
hospitalSchema.methods.toJSON = function () {
  const hospitalObject = this.toObject();
  delete hospitalObject.password;
  delete hospitalObject.tokens;
  return hospitalObject;
};

//*********GENERATE AUTH TOKEN WHEN HOSPITAL IS CREATED**************** */
hospitalSchema.methods.generateAuthToken = async function () {
  const hospital = this;
  const token = jwt.sign(
    { _id: hospital._id.toString(), role: hospital.role },
    process.env.JWT_SECRET,
    {
      expiresIn: 60 * 100,
    }
  );
  hospital.tokens = hospital.tokens.concat({ token });
  await hospital.save();
  return token;
};

//*******************Authenticate the hospital from Database************************** */
hospitalSchema.statics.findByCredentials = async (email, password) => {
  try {
    const hospital = await Hospital.findOne({ email });
    if (!hospital) {
      return 404; //User Not Found
    }
    const isMatch = await bcrypt.compare(password, hospital.password);
    if (!isMatch) {
      return 406; // Password is incorrect.. Not accepted
    }
    return hospital;
  } catch (err) {
    return 500; // Server error;
  }
};

//**********HASH PASSWORDS BEFORE SAVING THE DATA************ */
hospitalSchema.pre("save", async function (next) {
  const hospital = this;
  if (hospital.isModified("password")) {
    hospital.password = await bcrypt.hash(
      hospital.password,
      parseInt(process.env.ROUNDS)
    );
  }
  next();
});

const Hospital = Mongoose.model("Hospitals", hospitalSchema);
module.exports = Hospital;
