const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },


    location: {
      type: String,
      default: "Remote",
    },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Contract", "Remote"],
      default: "Full-time",
    },

    salary: {
      type: String,
      default: "Competitive",
    },
    description: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", jobSchema);
