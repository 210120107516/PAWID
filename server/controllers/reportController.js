const Report = require("../models/Report");
const Dog = require("../models/Dog");
const asyncHandler = require("express-async-handler");
const notificationService = require("../services/notificationService");
const { PERMISSIONS, hasPermission } = require('../config/roles');


// @desc    Create a new report
// @route   POST /api/reports
// @access  Public (for 'Found'), Private (for 'Lost', 'Injured' etc. - requires ownership)
const createReport = asyncHandler(async (req, res) => {
  const {
    dogId, // ID of the dog being reported
    reportType,
    reporterContact, // { name, contactInfo } for anonymous
    location, // { address, coordinates: [lng, lat] }
    description,
  } = req.body;

  // --- Validation ---
  if (!dogId || !reportType || !description) {
    res.status(400);
    throw new Error("Missing required fields: dogId, reportType, description");
  }

  const dog = await Dog.findById(dogId);
  if (!dog) {
    res.status(404);
    throw new Error("Dog not found with the provided ID.");
  }

  // --- Authorization ---
  const reporterId = req.user?._id;
  const reporterRole = req.user?.role; // Get logged-in user ID if available

  // --- Authorization & Dog Status Update Logic (as before) ---
  // --- Refined Authorization ---
  let requiredPermission = null;
  let checkOwnership = false;

  switch (reportType) {
      case 'Lost':
          requiredPermission = PERMISSIONS.CREATE_REPORT_LOST;
          checkOwnership = true; // Must be owner (or admin/staff with perm)
          break;
      case 'Injured':
          requiredPermission = PERMISSIONS.CREATE_REPORT_INJURED;
          checkOwnership = true; // Must be owner (or admin/staff with perm)
          break;
      case 'Found':
          requiredPermission = PERMISSIONS.CREATE_REPORT_FOUND; // Allows public/anon too
          break;
      case 'Sighting':
           requiredPermission = PERMISSIONS.CREATE_REPORT_SIGHTING; // Allows public/anon too
           break;
      // Add 'Other' or different types if needed
      default:
           // Allow 'Other' if user is logged in? Or specific perm?
           if (!reporterId) {
               res.status(401); throw new Error('Login required for this report type.');
           }
           // requiredPermission = PERMISSIONS.CREATE_REPORT_OTHER; // If defined
           break; // Or throw error for unknown type
  }

  // Check permission if required and user is logged in
  if (requiredPermission && reporterId && !hasPermission(reporterRole, requiredPermission)) {
    res.status(403);
    throw new Error(`Your role (${reporterRole}) cannot submit '${reportType}' reports.`);
}

// Check ownership if required
if (checkOwnership) {
    if (!reporterId) { // Should be caught by requiredPermission check above, but safety first
        res.status(401); throw new Error(`You must be logged in to report a dog as ${reportType}.`);
    }
    const isOwner = dog.owner.toString() === reporterId.toString();
    // Allow if owner OR if user has the required permission (e.g., Admin/Staff reporting lost dog in their care)
    if (!isOwner && !hasPermission(reporterRole, requiredPermission)) {
        res.status(403);
        throw new Error(`You are not authorized to report this dog as ${reportType}.`);
    }
}

  // --- Prepare Report Data ---
  const reportData = {
    dog: dogId,
    reportType,
    description,
    reporter: reporterId || undefined, // Set if user is logged in
    reporterContact: reporterId ? undefined : reporterContact, // Set if anonymous
    location: location
      ? {
          // Structure location data
          type: "Point",
          coordinates: location.coordinates, // Ensure [lng, lat] order
          address: location.address,
        }
      : undefined,
    reportStatus: "Open", // Default status
  };

  // --- Create Report ---
  const report = await Report.create(reportData);

  if (report) {
    // If notification was triggered earlier, update it with the real report ID if needed
    // (Or trigger notification here after report is successfully created)
    // Example: Re-triggering here
    if (reportType === "Found" && dogStatusUpdated && dog.status === "Found") {
      // Check conditions again
      // Ensure dog was previously Lost or Pet before status change
      // This check is slightly redundant if done correctly above, but safer
      // const previousStatus = ... // Would need to fetch dog again or pass status
      // if (previousStatus === 'Lost' || previousStatus === 'Pet') {
      notificationService.notifyOwnerDogFound(dog._id, report); // Pass the created report
      // }
    }

    // Notify admins/shelters about new reports (optional)
    // notificationService.notify('NewReportCreated', { reportId: report._id, dogId: dog._id, type: report.reportType });

    res.status(201).json(report);
  } else {
    res.status(400);
    throw new Error("Invalid report data");
  }
});

// @desc    Get reports for a specific dog
// @route   GET /api/reports/dog/:dogId
// @access  Private (Requires ownership or Admin/ShelterStaff role)
const getReportsForDog = asyncHandler(async (req, res) => {
  const { dogId } = req.params;

  const dog = await Dog.findById(dogId);
  if (!dog) {
    res.status(404);
    throw new Error("Dog not found");
  }

  // --- Authorization ---
  // Only owner or relevant staff can see all reports for a dog
  if (
    dog.owner.toString() !== req.user._id.toString() &&
    !["Admin", "ShelterStaff"].includes(req.user.role)
  ) {
    res.status(403);
    throw new Error("Not authorized to view reports for this dog.");
  }

  const reports = await Report.find({ dog: dogId })
    .populate("reporter", "name email role") // Populate reporter info if available
    .sort({ createdAt: -1 }); // Sort newest first

  res.json(reports);
});

const updateReportStatus = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const { reportStatus, resolutionDetails } = req.body; // Expecting new status and optional details

  // Validate input status
  const validStatuses = ["Open", "Investigating", "Resolved", "Closed"];
  if (!reportStatus || !validStatuses.includes(reportStatus)) {
    res.status(400);
    throw new Error(
      `Invalid status provided. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  const report = await Report.findById(reportId).populate(
    "dog",
    "name status owner"
  ); // Populate dog for context/notifications

  if (!report) {
    res.status(404);
    throw new Error("Report not found");
  }

  // --- Authorization already handled by route middleware ---
  // (authorize('Admin', 'ShelterStaff'))

  const previousStatus = report.reportStatus;
  report.reportStatus = reportStatus;
  report.resolutionDetails = resolutionDetails || report.resolutionDetails; // Update if provided
  report.resolvedBy = req.user._id; // User making the change
  report.resolvedAt = Date.now();

  const updatedReport = await report.save();

  // --- Update Dog Status if Report is Resolved ---
  // Example: If a 'Lost' report is 'Resolved', maybe set dog back to 'Pet'
  if (previousStatus !== "Resolved" && reportStatus === "Resolved") {
    if (report.reportType === "Lost" && report.dog?.status === "Lost") {
      // Check if there are other 'Open' Lost reports for this dog before changing status
      const otherOpenLostReports = await Report.countDocuments({
        dog: report.dog._id,
        reportType: "Lost",
        reportStatus: "Open",
        _id: { $ne: report._id }, // Exclude the current report
      });

      if (otherOpenLostReports === 0) {
        console.log(
          `Resolving last open 'Lost' report for dog ${report.dog.name}. Setting status to 'Pet'.`
        );
        report.dog.status = "Pet"; // Or 'Adopted' if applicable? Needs logic.
        await report.dog.save();
        // Notify owner their dog's 'Lost' status is resolved?
        // notificationService.notify(...)
      } else {
        console.log(
          `Resolved one 'Lost' report for dog ${report.dog.name}, but others remain open. Dog status unchanged.`
        );
      }
    }
    // Add logic for resolving 'Found' reports potentially changing dog status
    // else if (report.reportType === 'Found' && report.dog?.status === 'Found') { ... }
  }

  // --- Notifications ---
  // Notify reporter or owner about status change? (Complex - requires contact info/user lookup)
  // notificationService.notify('ReportStatusUpdate', { reportId: updatedReport._id, newStatus: updatedReport.reportStatus, dogName: report.dog?.name });

  res.json(updatedReport);
});

const getAllReports = asyncHandler(async (req, res) => {
  // --- Authorization handled by route middleware ---

  // Optional: Add filtering/pagination later (e.g., by status, type)
  const reports = await Report.find({}) // Find all reports
    .populate("dog", "name profileImageUrl") // Populate basic dog info
    .populate("reporter", "name email") // Populate reporter if available
    .sort({ createdAt: -1 }); // Sort newest first

  res.json(reports);
});

module.exports = {
  createReport,
  getReportsForDog,
  updateReportStatus, // Export new function
  getAllReports, // Export new function
};
