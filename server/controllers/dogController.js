const Dog = require("../models/Dog");
const User = require("../models/User"); // Needed for checking roles potentially
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const { PERMISSIONS, hasPermission } = require('../config/roles'); // Import roles config



const createDog = asyncHandler(async (req, res) => {
  const { name, breed, age, color, description, status, profileImageUrl } =
    req.body;

  // Basic validation (more with express-validator in routes)
  if (!name) {
    res.status(400);
    throw new Error("Dog name is required");
  }

  // Get owner and registrar from logged-in user (attached by 'protect' middleware)
  const registrarId = req.user._id;
  // For now, owner is the same as registrar. This could be adjusted later
  // if e.g., ShelterStaff registers a dog for adoption.
  const ownerId = req.user._id;

  const dog = await Dog.create({
    name,
    breed,
    age,
    color,
    description,
    status: status || "Pet", // Default to 'Pet' if not provided
    owner: ownerId,
    registeredBy: registrarId,
    profileImageUrl,
  });

  if (dog) {
    res.status(201).json(dog);
  } else {
    res.status(400);
    throw new Error("Invalid dog data");
  }
});


const getMyDogs = asyncHandler(async (req, res) => {
  const dogs = await Dog.find({ owner: req.user._id }).sort({ createdAt: -1 }); // Sort newest first
  res.json(dogs);
});

const getDogById = asyncHandler(async (req, res) => {
    const dog = await Dog.findById(req.params.id).populate('owner', 'name email');
    if (!dog) { /* ... 404 error ... */ }
  
    // --- Refined Authorization Check ---
    const isOwner = dog.owner._id.toString() === req.user._id.toString();
    const canViewAny = hasPermission(req.user.role, PERMISSIONS.VIEW_ANY_DOG);
  
    if (!isOwner && !canViewAny) {
       res.status(403); // Forbidden
       throw new Error('Not authorized to view this dog\'s details');
    }
    res.json(dog);
  });
  


const updateDog = asyncHandler(async (req, res) => {
    const dog = await Dog.findById(req.params.id);
    if (!dog) { /* ... 404 error ... */ }
  
    // --- Refined Authorization Check ---
    const isOwner = dog.owner.toString() === req.user._id.toString();
    const canUpdateAny = hasPermission(req.user.role, PERMISSIONS.UPDATE_ANY_DOG);
    const hasOwnPerm = hasPermission(req.user.role, PERMISSIONS.UPDATE_OWN_DOG); // Check if role generally allows updating own dogs
  
    if (!((isOwner && hasOwnPerm) || canUpdateAny) ) {
        res.status(403); // Forbidden
        throw new Error('Not authorized to update this dog');
    }
  
    // ... (update logic) ...
    dog.name = req.body.name || dog.name;
    // ... other fields ...
    const updatedDog = await dog.save();
    res.json(updatedDog);
  });


const deleteDog = asyncHandler(async (req, res) => {
    const dog = await Dog.findById(req.params.id);
    if (!dog) { /* ... 404 error ... */ }

    // --- Refined Authorization Check ---
    const isOwner = dog.owner.toString() === req.user._id.toString();
    const canDeleteAny = hasPermission(req.user.role, PERMISSIONS.DELETE_ANY_DOG);
     const hasOwnPerm = hasPermission(req.user.role, PERMISSIONS.DELETE_OWN_DOG);

    if (!((isOwner && hasOwnPerm) || canDeleteAny)) {
        res.status(403);
        throw new Error('Not authorized to delete this dog');
    }

    await dog.deleteOne();
    res.json({ message: `Dog '${dog.name}' removed successfully`, _id: req.params.id });
});





const getPublicDogInfoByScanId = asyncHandler(async (req, res) => {
  const { uniqueSecureId } = req.params;

  if (!uniqueSecureId) {
    res.status(400);
    throw new Error("Scan ID is required");
  }

  // Find dog by the unique secure ID
  const dog = await Dog.findOne({ uniqueSecureId: uniqueSecureId }).select(
    "name breed status description color profileImageUrl createdAt"
  ); // Select only public fields

  if (!dog) {
    res.status(404);
    throw new Error("Dog identification invalid or not found.");
  }

  // Return only the selected public information
  res.json({
    _id: dog._id, // Include internal ID for potential reporting links
    name: dog.name,
    breed: dog.breed,
    status: dog.status, // Crucial for Lost/Found status
    description: dog.description, // Public description
    color: dog.color,
    profileImageUrl: dog.profileImageUrl,
    registeredDate: dog.createdAt, // Show registration date

  });
});

module.exports = {
  createDog,
  getMyDogs,
  getDogById,
  updateDog,
  deleteDog,
  getPublicDogInfoByScanId,
};
