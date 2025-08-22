const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // this will be the person’s name
  email: { type: String, unique: true, required: true },
  password: String,
  role: { type: String, enum: ["applicant", "underwriter"], required: true },

  // extra fields only for underwriters
  yearsExperience: Number,
  region: String,
  insuranceTypes: [String],
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
