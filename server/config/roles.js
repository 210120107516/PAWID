// Define Permissions Constants
const PERMISSIONS = {
    // User Management (Future)
    // MANAGE_USERS: 'manage_users',

    // Dog Management
    CREATE_DOG: 'create_dog',        // Can register a new dog profile
    VIEW_OWN_DOGS: 'view_own_dogs',    // Can view dogs they own/registered
    VIEW_ANY_DOG: 'view_any_dog',     // Can view full details of any dog
    UPDATE_OWN_DOG: 'update_own_dog',  // Can update dogs they own
    UPDATE_ANY_DOG: 'update_any_dog',  // Can update any dog's profile
    DELETE_OWN_DOG: 'delete_own_dog',  // Can delete dogs they own
    DELETE_ANY_DOG: 'delete_any_dog',  // Can delete any dog

    // Report Management
    CREATE_REPORT_FOUND: 'create_report_found', // Can submit a 'Found' report (implicitly public + users)
    CREATE_REPORT_LOST: 'create_report_lost',   // Can submit a 'Lost' report (requires ownership/auth)
    CREATE_REPORT_INJURED: 'create_report_injured', // Can submit an 'Injured' report (requires ownership/auth)
    CREATE_REPORT_SIGHTING: 'create_report_sighting',// Can submit a 'Sighting' report (public + users)
    VIEW_OWN_DOG_REPORTS: 'view_own_dog_reports', // Can view reports related to their own dog
    VIEW_ALL_REPORTS: 'view_all_reports',       // Can view all reports in the system
    UPDATE_REPORT_STATUS: 'update_report_status', // Can change the status of any report
    // VIEW_REPORTER_CONTACT: 'view_reporter_contact' // Permission to see anonymous contact info? (Careful with privacy)
};

// Define Roles and Assign Permissions
const ROLES = {
    Owner: [
        PERMISSIONS.CREATE_DOG,
        PERMISSIONS.VIEW_OWN_DOGS,
        PERMISSIONS.UPDATE_OWN_DOG,
        PERMISSIONS.DELETE_OWN_DOG,
        PERMISSIONS.CREATE_REPORT_LOST, // Assumes owner reports their own dog lost
        PERMISSIONS.CREATE_REPORT_INJURED, // Assumes owner reports their own dog injured
        PERMISSIONS.VIEW_OWN_DOG_REPORTS,
        // Owners can also implicitly use public permissions like Found/Sighting
        PERMISSIONS.CREATE_REPORT_FOUND,
        PERMISSIONS.CREATE_REPORT_SIGHTING,
    ],
    ShelterStaff: [
        PERMISSIONS.CREATE_DOG,         // Can register dogs found/surrendered to shelter
        PERMISSIONS.VIEW_ANY_DOG,      // Can view details of any dog (e.g., check for owner)
        PERMISSIONS.UPDATE_ANY_DOG,    // Can update status/details of dogs in shelter care
        // PERMISSIONS.DELETE_ANY_DOG, // Maybe only Admin can delete? Or staff for shelter dogs? Decide policy.
        PERMISSIONS.CREATE_REPORT_FOUND,
        PERMISSIONS.CREATE_REPORT_SIGHTING,
        PERMISSIONS.VIEW_ALL_REPORTS,       // Can see reports to manage incidents
        PERMISSIONS.UPDATE_REPORT_STATUS, // Can manage report lifecycle
        // PERMISSIONS.VIEW_REPORTER_CONTACT, // Allow staff to see contact info from 'Found' reports?
    ],
    Vet: [ // Example role - adjust permissions as needed
        PERMISSIONS.VIEW_ANY_DOG,      // Vet might need to look up dog by ID/scan
        PERMISSIONS.CREATE_REPORT_INJURED, // Vet can report an injury found
        PERMISSIONS.CREATE_REPORT_SIGHTING,
        PERMISSIONS.CREATE_REPORT_FOUND,
        // Maybe limited update permissions? (e.g., add medical notes - requires schema change)
    ],
    Admin: [ // Superuser role
        // Includes all permissions
        ...Object.values(PERMISSIONS), // Grant all defined permissions
    ],
    // Public/Anonymous users implicitly have permissions for actions not requiring login,
    // like viewing the public scan page or submitting Found/Sighting reports (handled by route protection)
};

// Function to check if a role has a specific permission
const hasPermission = (role, permission) => {
    return ROLES[role]?.includes(permission) || false;
};


module.exports = {
    ROLES,
    PERMISSIONS,
    hasPermission,
};