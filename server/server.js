const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const authRoutes = require("./routes/auth");
const underwriterRoutes = require("./routes/underwriters");
const flaskApiRoutes = require("./routes/flaskApi");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// ✅ CORS setup
app.use(cors());

app.use(express.json());


// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Atlas connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ==========================
// Schemas & Models
// ==========================

// Application Schema
const applicationSchema = new mongoose.Schema({
  applicantId: { type: String, required: true },
  underwriterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Underwriter', required: true },
  underwriterName: { type: String, required: true },
  insuranceType: { type: String, required: true },
  status: { type: String, default: 'Pending' },

  personalInfo: {
    fullName: String,
    dateOfBirth: Date,
    gender: String,
    maritalStatus: String,
    email: String,
    phone: String,
    address: String,
  },
  employmentInfo: {
    occupation: String,
    industry: String,
    employmentType: String,
    annualIncome: Number,
  },
  healthInfo: {
    smoker: Boolean,
    alcohol: Boolean,
    height: Number,
    weight: Number,
    preExistingConditions: Boolean,
    medicalConditions: String,
    familyHistory: [String],
  },
  insuranceSpecificData: mongoose.Schema.Types.Mixed,
  consents: {
    healthConsent: Boolean,
    creditConsent: Boolean,
    apraConsent: Boolean,
  },
  additionalDetails: String,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Application = mongoose.model('Application', applicationSchema);

// Underwriter Schema
const underwriterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  insuranceTypes: { type: [String], required: true }, // Multiple types (Life, Health, Property, etc.)
  yearsExperience: { type: Number, required: true },  // Replaces 'experience'
  region: { type: String, required: true },
  certificates: [String],                            // Array of certificate names
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },        // hashed for auth later
  createdAt: { type: Date, default: Date.now },
});

const Underwriter = mongoose.model('Underwriter', underwriterSchema);


// ==========================
// Routes
// ==========================
app.use("/api/auth", authRoutes);
app.use("/api/underwriters", underwriterRoutes);
app.use("/api", flaskApiRoutes);

// // Get all underwriters (excluding password)
// app.get('/api/underwriters', async (req, res) => {
//   try {
//     const underwriterRoutes = require("./routes/underwriters");
//     app.use("/api/underwriters", underwriterRoutes);
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch underwriters',
//       error: error.message
//     });
//   }
// });

// Register new underwriter
app.post('/api/underwriters', async (req, res) => {
  try {
    const {
      name,
      insuranceTypes,
      yearsExperience,
      region,
      certificates,
      email,
      phone,
      password
    } = req.body;

    // Check required fields
    if (!name || !insuranceTypes || !yearsExperience || !region || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check for existing email
    const existing = await Underwriter.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUnderwriter = new Underwriter({
      name,
      insuranceTypes,   // store as array in DB
      yearsExperience,  // store number
      region,
      certificates,
      email,
      phone,
      password: hashedPassword,
    });

    const savedUnderwriter = await newUnderwriter.save();

    // Exclude password & format response
    const { password: _, ...underwriterWithoutPassword } = savedUnderwriter.toObject();

    res.status(201).json({
      success: true,
      underwriter: {
        ...underwriterWithoutPassword,
        insuranceTypes: underwriterWithoutPassword.insuranceTypes?.join(", "), // return as CSV string
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add underwriter',
      error: error.message
    });
  }
});


// Applications
app.post('/api/applications', async (req, res) => {
  try {
    const applicationData = req.body;

    const application = new Application({
      applicantId: applicationData.applicantId,
      underwriterId: applicationData.selectedUnderwriter._id,  // will be MongoDB ObjectId now
      underwriterName: applicationData.selectedUnderwriter.name,
      insuranceType: applicationData.insuranceType,
      personalInfo: applicationData.personalInfo,
      employmentInfo: applicationData.employmentInfo,
      healthInfo: applicationData.healthInfo,
      insuranceSpecificData: applicationData.insuranceSpecificData,
      consents: applicationData.consents,
      additionalDetails: applicationData.additionalDetails,
    });

    const savedApplication = await application.save();
    res.status(201).json({ success: true, message: 'Application submitted successfully', applicationId: savedApplication._id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit application', error: error.message });
  }
});

app.get('/api/applications/underwriter/:underwriterId', async (req, res) => {
  try {
    const { underwriterId } = req.params;
    const applications = await Application.find({ underwriterId }).sort({ createdAt: -1 });
    res.json({ success: true, applications });
  } catch (error) {
    console.error("Error fetching applications for underwriter:", error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications', error: error.message });
  }
});

app.get('/api/applications/applicant/:applicantId', async (req, res) => {
  try {
    const { applicantId } = req.params;
    const applications = await Application.find({ applicantId }).sort({ createdAt: -1 });
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch applications', error: error.message });
  }
});

app.put('/api/applications/:applicationId/status', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const application = await Application.findByIdAndUpdate(
      applicationId,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    res.json({ success: true, message: 'Application status updated', application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update application status', error: error.message });
  }
});

// ==========================
// Start server
// ==========================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
