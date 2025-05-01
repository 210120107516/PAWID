import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ReportForm from '../components/ReportForm';
import reportService from '../services/reportService';
import dogService from '../services/dogService'; // To fetch basic dog info for context

function ReportIncidentPage() {
  const { dogId } = useParams(); // Get dog ID from URL
  const navigate = useNavigate();
  const location = useLocation(); // To get query params like initial type

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dogName, setDogName] = useState(''); // For display
  const [loadingDog, setLoadingDog] = useState(true);

  // Get initial report type from query params (e.g., /report/123?type=Found)
  const queryParams = new URLSearchParams(location.search);
  const initialType = queryParams.get('type') || 'Found'; // Default to 'Found'

  // Fetch basic dog info (name) to display on the form page
  useEffect(() => {
      const fetchDogName = async () => {
          setLoadingDog(true);
          try {
              // Use the public scan endpoint if available and appropriate,
              // otherwise use the protected getDogById if user might be logged in.
              // For simplicity here, let's assume we just need the name and try a basic fetch.
              // A dedicated endpoint for just name/basic info might be better.
              // This might fail if user isn't logged in and tries to hit protected endpoint.
              // Consider fetching name from where user clicked the link if possible.

              // Simplification: If we can't easily get the name, just skip it.
              // const dogData = await dogService.getDogById(dogId); // This requires login
              // setDogName(dogData.name);

              // Alternative: If coming from public view, pass name via state? Risky.
              setDogName(''); // Or try fetching from public endpoint if implemented

          } catch (err) {
              console.warn("Could not fetch dog name for reporting page:", err.message);
              setDogName(''); // Set empty if fetch fails
          } finally {
              setLoadingDog(false);
          }
      }
      if (dogId) {
          fetchDogName();
      } else {
          setError("No Dog ID provided for the report.");
          setLoadingDog(false);
      }

  }, [dogId]);


  const handleSubmit = async (reportData) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await reportService.createReport(reportData);
      setSuccess(`Report submitted successfully! Thank you.`);
      // Optional: Redirect after a delay or leave message
      setTimeout(() => {
          // Redirect to home, dashboard, or dog profile?
          navigate('/'); // Redirect home after success
      }, 3000); // 3 second delay

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to submit report. Please try again.';
      setError(errorMessage);
      console.error('Report submission error:', err.response?.data || err.message);
      setIsSubmitting(false); // Keep form active on error
    }
    // Don't set isSubmitting false on success if navigating away
  };

  if (!dogId && !error) return <div className="text-center mt-8 text-red-500">Error: No Dog ID specified in the URL.</div>;

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">
          Report Incident {loadingDog ? '...' : (dogName ? `for ${dogName}` : 'for Dog')}
      </h1>
      <p className="text-sm text-gray-600 mb-6 text-center">
          Use this form to report information about the dog identified by ID: <code className="text-xs bg-gray-100 p-1 rounded">{dogId}</code>.
      </p>

      {success && <p className="text-green-600 bg-green-100 p-3 rounded mb-4 text-center">{success}</p>}
      {error && !success && <p className="text-red-500 bg-red-100 p-3 rounded mb-4 text-center">{error}</p>}

      {!success && ( // Hide form on success
           <ReportForm
                dogId={dogId}
                initialReportType={initialType}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />
      )}
    </div>
  );
}

export default ReportIncidentPage;