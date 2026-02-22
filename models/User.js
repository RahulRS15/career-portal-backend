const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false }, // hide password by default
    role: { type: String, enum: ["student", "admin", "company"], required: true },

    mobile: { type: String, default: "" },
    status: { type: String, enum: ["fresher", "experienced"], default: "" },
    gender: { type: String, enum: ["male", "female", "other"], default: "" },
    dob: { type: String, default: "" },
    education: { type: String, default: "" },
    workExp: { type: String, default: "" },
    skills: { type: [String], default: [] },
    resume: { type: String, default: "" },

    profile: {
      bio: { type: String, default: "" },
      skills: [{ type: String }],
      resume: { type: String, default: "" },
      resumeName: { type: String, default: "" },
      profilePhoto: { type: String, default: "" },
    },

    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
    companyDescription: { type: String, default: "" },
    companyLogo: { type: String, default: "" },

    refreshToken: { type: String, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 🔹 Pre-save: Hash password if modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔹 Instance method: compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);