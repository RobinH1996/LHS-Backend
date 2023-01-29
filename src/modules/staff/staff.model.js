const Mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new Mongoose.Schema(
  {
    role: { type: String, default: "staff" },
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
    jobTitle: {
      type: String,
      default: "Registered Nurse(RN)",
    },

    resume: {
      link: { type: String },
      lastUpdated: { type: Date, default: new Date() },
    },
    avatar: {
      type: String,
      default: "",
    },
    badge: {
      type: Boolean,
      default: true,
    },

    natureOfJob: [
      {
        type: String,
        trim: true,
      },
    ],
    workSchedule: [
      {
        type: String,
        trim: true,
      },
    ],
    weekendAvailability: { type: Boolean, default: false, trim: true },
    startWorkdate: { type: String, trim: true },
    immediatelyStart: { type: Boolean },
    currentLocation: {
      name: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
    },
    otherCities: [
      {
        name: { type: String, trim: true },
        state: { type: String, trim: true },
        zipCode: { type: String, trim: true },
      },
    ],

    nursingLicence: [
      {
        image: { type: String },
        name: { type: String, trim: true },
        state: { type: String, trim: true },
        number: { type: String, trim: true },
        expirationDate: { type: String, trim: true },
      },
    ],

    liabilityInsurance: {
      insuranceProvider: { type: String, trim: true },
      policyNumber: { type: String, trim: true },
    },

    drugTest: {
      report: { type: String, trim: true },
      testDate: { type: Date, trim: true },
      status: { type: String, trim: true },
    },

    certifications: [
      {
        name: { type: String, trim: true },
        certifyingAuthority: { type: String, trim: true },
        receivedOn: { type: Date, trim: true },
        expirationDate: { type: Date, trim: true },
      },
    ],

    education: {
      degree: { type: String, trim: true },
      college: { type: String, trim: true },
      receivedOn: { type: Date, trim: true },
    },

    experiencedIn: { type: String, trim: true },

    bankName: { type: String, default: "", trim: true },

    routingNumber: { type: String, default: "", trim: true },

    accountNumber: { type: String, default: "", trim: true },
    // medicalSettings: {
    //   type: String,
    //   default: "Urgent Care Centers",
    //   trim: true,
    // },
    agreement: {
      text: { type: String, trim: true },
      signedOn: {
        type: Date,
        default: Date.now,
      },
    },
    socialSecurityNumber: { type: String, default: "", trim: true },

    totalContracts: [{ type: String, trim: true }],
    contractsCompleted: [{ type: String, trim: true }],
    activeContracts: [{ type: String, trim: true }],
    jobsApplied: [{ type: String, trim: true }],
    jobsOffers: [{ type: String, trim: true }],
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
//********RETURN THE JSON OBJECT WITHOUT SENSITIVE DATA**************** */
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};

//*********GENERATE AUTH TOKEN WHEN USER IS CREATED**************** */
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    { _id: user._id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

//*******************Authenticate the user from Database************************** */
userSchema.statics.findByCredentials = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    // if (!user) {
    //   throw new Error("User not found");
    // }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Unable to Login");
    }
    return user;
  } catch (err) {
    return "Password Error";
  }
};

//**********HASH PASSWORDS BEFORE SAVING THE DATA************ */
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(
      user.password,
      parseInt(process.env.ROUNDS)
    );
  }
  next();
});

module.exports = User = Mongoose.model("User", userSchema);
