import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const dogStatuses = ['Pet', 'Stray', 'Lost', 'Found', 'Adopted']; // Keep consistent with backend enum

function DogForm({ onSubmit, initialData = {}, submitButtonText = 'Submit', isSubmitting = false }) {
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    color: '',
    description: '',
    status: 'Pet',
    profileImageUrl: '',
    ...initialData, // Spread initial data, potentially overriding defaults
  });

  // Update form if initialData changes (e.g., when editing)
  useEffect(() => {
      // Only update if initialData is provided and differs significantly (e.g., by ID)
      if (initialData && initialData._id !== formData._id) {
          setFormData({
            name: '',
            breed: '',
            age: '',
            color: '',
            description: '',
            status: 'Pet',
            profileImageUrl: '',
            ...initialData
          });
      }
  }, [initialData]); // Rerun effect if initialData changes


  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prevState => ({
      ...prevState,
      // Handle age specifically as it should be a number
      [name]: type === 'number' ? (value === '' ? '' : parseInt(value, 10)) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Prepare data: remove empty strings for optional fields if needed by backend
    // or handle appropriately (e.g., send null). For now, send as is.
    const dataToSend = { ...formData };
    if (dataToSend.age === '') delete dataToSend.age; // Don't send empty string for age
    if (dataToSend.profileImageUrl === '') delete dataToSend.profileImageUrl; // Don't send empty string for URL

    onSubmit(dataToSend); // Pass prepared form data to the handler
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name *</label>
        <input
          type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label htmlFor="breed" className="block text-sm font-medium text-gray-700">Breed</label>
        <input
          type="text" id="breed" name="breed" value={formData.breed} onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isSubmitting}
        />
      </div>
       <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age (Years)</label>
        <input
          type="number" id="age" name="age" value={formData.age} onChange={handleChange} min="0"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isSubmitting}
        />
      </div>
       <div>
        <label htmlFor="color" className="block text-sm font-medium text-gray-700">Color</label>
        <input
          type="text" id="color" name="color" value={formData.color} onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isSubmitting}
        />
      </div>
       <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
        <select
            id="status" name="status" value={formData.status} onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={isSubmitting}
        >
            {dogStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
            ))}
        </select>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Max 500 chars)</label>
        <textarea
          id="description" name="description" value={formData.description} onChange={handleChange} maxLength={500} rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isSubmitting}
        ></textarea>
      </div>
       <div>
        <label htmlFor="profileImageUrl" className="block text-sm font-medium text-gray-700">Profile Image URL (Optional)</label>
        <input
          type="url" id="profileImageUrl" name="profileImageUrl" value={formData.profileImageUrl} onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50`}
        >
          {isSubmitting ? 'Processing...' : submitButtonText}
        </button>
      </div>
    </form>
  );
}

DogForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    initialData: PropTypes.object,
    submitButtonText: PropTypes.string,
    isSubmitting: PropTypes.bool,
};

export default DogForm;