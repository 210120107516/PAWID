const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  dog: { // The dog this report is about
    type: mongoose.Schema.ObjectId,
    ref: 'Dog',
    required: true,
    index: true,
  },
  reportType: {
    type: String,
    enum: ['Lost', 'Found', 'Injured', 'Sighting', 'Other'], // Types of reports
    required: [true, 'Please specify the report type'],
  },
  reporter: { // User who reported (if logged in)
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    // Not strictly required, as reports can be anonymous (e.g., 'Found')
  },
  // Information for anonymous reporters
  reporterContact: {
    name: { type: String, trim: true },
    contactInfo: { type: String, trim: true }, // Could be phone or email
    // Consider encrypting contactInfo if sensitive
  },
  location: { // GeoJSON Point preferred for geospatial queries later
    type: {
        type: String, // Don't forget to set the type to Point!
        enum: ['Point'],
        // required: true // Make location required if necessary
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        // required: true
        index: '2dsphere' // Index for geospatial queries
    },
    address: { // Human-readable address or description
      type: String,
      trim: true,
    }
  },
  description: { // Details about the incident
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  reportStatus: {
    type: String,
    enum: ['Open', 'Investigating', 'Resolved', 'Closed'],
    default: 'Open',
    index: true,
  },
  // Optional fields for resolution
  resolutionDetails: {
    type: String,
    trim: true,
  },
  resolvedBy: {
     type: mongoose.Schema.ObjectId,
     ref: 'User',
  },
  resolvedAt: {
     type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Optional: Validate reporter info based on type
reportSchema.pre('save', function(next) {
  if (!this.reporter && !this.reporterContact?.contactInfo && this.reportType === 'Found') {
      // For 'Found' reports, require either logged-in user or contact info
      // return next(new Error('Please provide contact information or log in to submit a Found report.'));
      // Decide on policy: allow fully anonymous 'Found' or require contact? For now, allow.
  }
   if (this.reporter && this.reporterContact?.contactInfo) {
       // Clear anonymous contact info if submitted by a logged-in user
       this.reporterContact = undefined;
   }
  next();
});


const Report = mongoose.model('Report', reportSchema);

module.exports = Report;