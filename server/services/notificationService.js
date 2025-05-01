const User = require('../models/User'); // To potentially find user emails
const Dog = require('../models/Dog');   // To get dog details

// Basic console log notification service
const notify = (type, details) => {
    console.log(`--- NOTIFICATION ---`);
    console.log(`Type: ${type}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Details:`, details);
    console.log(`--------------------`);
};

// Example specific notification function
const notifyOwnerDogFound = async (dogId, report) => {
    try {
        const dog = await Dog.findById(dogId).populate('owner', 'name email');
        if (!dog || !dog.owner) {
            console.error(`[Notification Error] Cannot notify owner: Dog or owner not found for dog ID ${dogId}`);
            return;
        }

        // In a real system, you'd use dog.owner.email to send an email
        notify('DogFound', {
            ownerName: dog.owner.name,
            ownerEmail: dog.owner.email, // For logging; use this for actual email sending
            dogName: dog.name,
            dogId: dog._id,
            reportId: report._id,
            reportDescription: report.description,
            reporterContact: report.reporterContact, // Include if available
            reportLocation: report.location?.address,
        });

    } catch (error) {
        console.error(`[Notification Error] Failed to send DogFound notification for dog ID ${dogId}:`, error);
    }
};

// Add more specific functions as needed (e.g., notifyAdminNewReport)

module.exports = {
    notify, // General purpose logger
    notifyOwnerDogFound,
    // Add other specific notification functions here
};