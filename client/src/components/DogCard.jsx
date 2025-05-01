import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// Simple fallback image URL
const FALLBACK_IMAGE_URL = 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=No+Image';


function DogCard({ dog, onDelete }) {

  const handleDeleteClick = (e) => {
      e.preventDefault(); // Prevent link navigation if delete button is inside Link
      if (window.confirm(`Are you sure you want to delete ${dog.name}? This action cannot be undone.`)) {
          onDelete(dog._id);
      }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <Link to={`/dogs/${dog._id}`} className="block"> {/* Link the whole card */}
        <img
          // Use dog's image or fallback, add alt text for accessibility
          src={dog.profileImageUrl || FALLBACK_IMAGE_URL}
          alt={`Profile picture of ${dog.name}`}
          className="w-full h-48 object-cover" // Adjust height as needed
          onError={(e) => { e.target.onerror = null; e.target.src=FALLBACK_IMAGE_URL; }} // Handle broken image links
        />
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-1 text-gray-800">{dog.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{dog.breed || 'Unknown Breed'}</p>
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium
             ${dog.status === 'Lost' ? 'bg-red-100 text-red-800' :
               dog.status === 'Found' ? 'bg-yellow-100 text-yellow-800' :
               dog.status === 'Adopted' ? 'bg-green-100 text-green-800' :
               'bg-blue-100 text-blue-800'}`}>
            {dog.status}
          </span>
          {/* Optionally add age or color here */}
          {/* <p className="text-sm text-gray-500 mt-1">{dog.age !== undefined ? `${dog.age} years old` : ''}</p> */}
        </div>
      </Link>
      {/* Add Edit/Delete buttons outside the main link if preferred, or inside with care */}
       <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
           <Link
              to={`/dogs/edit/${dog._id}`} // Separate edit route
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
           >
               Edit
           </Link>
           {onDelete && ( // Only show delete if handler is provided
               <button
                   onClick={handleDeleteClick}
                   className="text-sm text-red-600 hover:text-red-800 font-medium"
               >
                   Delete
               </button>
           )}
       </div>
    </div>
  );
}

DogCard.propTypes = {
    dog: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        breed: PropTypes.string,
        status: PropTypes.string,
        profileImageUrl: PropTypes.string,
        // Add other expected props if needed
    }).isRequired,
    onDelete: PropTypes.func // Make onDelete optional or required based on usage
};

export default DogCard;