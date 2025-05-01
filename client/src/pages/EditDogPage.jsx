import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DogForm from '../components/DogForm';
import dogService from '../services/dogService';
import { useAuth } from '../contexts/AuthContext';

function EditDogPage() {
  const [initialData, setInitialData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams(); // Get dog ID from URL
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchDogForEdit = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await dogService.getDogById(id);
        // Basic check if user is authorized to edit (backend enforces this too)
        if (user && (data.owner._id === user._id || user.role === 'Admin')) {
            setInitialData(data);
        } else {
            setError('You are not authorized to edit this dog.');
            // Optionally redirect
             // navigate('/my-dogs');
        }
      } catch (err) {
        setError(`Failed to load dog data for editing: ${err.response?.data?.message || err.message}`);
        console.error('Fetch dog for edit error:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id && user) {
      fetchDogForEdit();
    } else if (!user) {
       setError("Please log in to edit dog profiles.");
       setLoading(false);
    }
  }, [id, user, navigate]); // Add navigate to dependencies if used inside effect

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError('');
    try {
      const updatedDog = await dogService.updateDog(id, formData);
      console.log('Dog updated:', updatedDog);
      navigate(`/dogs/${updatedDog._id}`); // Redirect to profile page after update
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to update dog. Please check the details.';
      setError(errorMessage);
      console.error('Dog update error:', err.response?.data || err.message);
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-8">Loading dog data for editing...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;
  if (!initialData) return <div className="text-center mt-8">Could not load dog data.</div>; // Error or unauthorized

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Edit {initialData.name}'s Profile</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <DogForm
        onSubmit={handleSubmit}
        initialData={initialData}
        submitButtonText="Update Profile"
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default EditDogPage;