import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext'; // To check if user is logged in

const reportTypes = ['Found', 'Sighting', 'Lost', 'Injured', 'Other']; // Consistent order

function ReportForm({ dogId, initialReportType = 'Found', onSubmit, isSubmitting = false }) {
  const { user } = useAuth(); // Get logged-in user status
  const [formData, setFormData] = useState({
    reportType: initialReportType,
    description: '',
    locationAddress: '', // Separate fields for easier state management
    locationLat: '',
    locationLng: '',
    reporterName: '', // For anonymous
    reporterContact: '', // For anonymous
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Basic check if the report requires login
  const requiresLogin = ['Lost', 'Injured'].includes(formData.reportType);
  const showAnonymousFields = !user && formData.reportType === 'Found'; // Show only if anonymous 'Found' report

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (requiresLogin && !user) {
      setError(`You must be logged in to report a dog as ${formData.reportType}.`);
      return;
    }

    // --- Prepare data for submission ---
    const reportData = {
      dogId: dogId,
      reportType: formData.reportType,
      description: formData.description,
    };

    // Add location if coordinates are provided
    if (formData.locationLat && formData.locationLng) {
      const lat = parseFloat(formData.locationLat);
      const lng = parseFloat(formData.locationLng);
      if (!isNaN(lat) && !isNaN(lng)) {
          reportData.location = {
            coordinates: [lng, lat], // Ensure [lng, lat] order
            address: formData.locationAddress || undefined,
          };
      } else {
          setError("Invalid latitude or longitude provided.");
          return;
      }
    } else if (formData.locationAddress) {
        // Send address even if coords aren't set
        reportData.location = { address: formData.locationAddress };
    }


    // Add anonymous reporter info if applicable
    if (showAnonymousFields && (formData.reporterName || formData.reporterContact)) {
      reportData.reporterContact = {
        name: formData.reporterName || undefined,
        contactInfo: formData.reporterContact || undefined,
      };
       if (!formData.reporterContact) {
            setError("Please provide contact information for a 'Found' report if you are not logged in.");
            // Decide policy: make contact mandatory for anonymous 'Found'?
            // return; // Uncomment to enforce contact info
       }
    }

    onSubmit(reportData); // Pass prepared data to parent handler
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
       {requiresLogin && !user && (
           <p className="text-orange-600 text-sm mb-4">
               Note: Reporting as '{formData.reportType}' requires you to be logged in.
               Please <a href="/login" className="underline">log in</a> first.
           </p>
       )}

      <div>
        <label htmlFor="reportType" className="block text-sm font-medium text-gray-700">Report Type *</label>
        <select
          id="reportType" name="reportType" value={formData.reportType} onChange={handleChange} required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isSubmitting}
        >
          {reportTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description *</label>
        <textarea
          id="description" name="description" value={formData.description} onChange={handleChange} required maxLength={1000} rows={4}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Provide details about the situation, dog's condition, exact location, time, etc."
          disabled={isSubmitting}
        ></textarea>
      </div>

       {/* Location Fields */}
       <fieldset className="border p-3 rounded">
            <legend className="text-sm font-medium text-gray-700 px-1">Location (Optional)</legend>
            <div className="space-y-3 mt-1">
                 <div>
                    <label htmlFor="locationAddress" className="block text-xs font-medium text-gray-600">Address or Area Description</label>
                    <input type="text" id="locationAddress" name="locationAddress" value={formData.locationAddress} onChange={handleChange}
                        className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                        placeholder="e.g., Near Central Park entrance on 5th Ave"
                        disabled={isSubmitting}
                    />
                 </div>
                 <div className="flex space-x-2">
                    <div className="flex-1">
                        <label htmlFor="locationLat" className="block text-xs font-medium text-gray-600">Latitude</label>
                        <input type="number" step="any" id="locationLat" name="locationLat" value={formData.locationLat} onChange={handleChange}
                            className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                            placeholder="e.g., 40.7128"
                            disabled={isSubmitting}
                        />
                    </div>
                     <div className="flex-1">
                        <label htmlFor="locationLng" className="block text-xs font-medium text-gray-600">Longitude</label>
                        <input type="number" step="any" id="locationLng" name="locationLng" value={formData.locationLng} onChange={handleChange}
                            className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                            placeholder="e.g., -74.0060"
                            disabled={isSubmitting}
                        />
                    </div>
                 </div>
            </div>
        </fieldset>


      {/* Anonymous Reporter Fields */}
      {showAnonymousFields && (
        <fieldset className="border p-3 rounded bg-gray-50">
          <legend className="text-sm font-medium text-gray-700 px-1">Your Contact Info (Optional but Recommended)</legend>
          <p className="text-xs text-gray-500 mb-2">This helps the owner or shelter contact you if needed. It won't be shown publicly.</p>
          <div className="space-y-3 mt-1">
            <div>
              <label htmlFor="reporterName" className="block text-xs font-medium text-gray-600">Your Name</label>
              <input type="text" id="reporterName" name="reporterName" value={formData.reporterName} onChange={handleChange}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="reporterContact" className="block text-xs font-medium text-gray-600">Contact (Email or Phone)</label>
              <input type="text" id="reporterContact" name="reporterContact" value={formData.reporterContact} onChange={handleChange}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                placeholder="Required if you want to be contacted"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </fieldset>
      )}

      <div>
        <button
          type="submit"
          disabled={isSubmitting || (requiresLogin && !user)}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </div>
    </form>
  );
}

ReportForm.propTypes = {
  dogId: PropTypes.string.isRequired,
  initialReportType: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export default ReportForm;