import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DogForm from '../components/DogForm';
import dogService from '../services/dogService';
import { useAuth } from '../contexts/AuthContext'; // To ensure user is logged in

function RegisterDogPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user context

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError('');
    if (!user) {
        setError('You must be logged in to register a dog.');
        setIsSubmitting(false);
        return;
    }
    try {
      const newDog = await dogService.createDog(formData);
      console.log('Dog registered:', newDog);
      // Redirect to the new dog's profile page or 'My Dogs' list
      navigate(`/dogs/${newDog._id}`); // Or navigate('/my-dogs');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to register dog. Please check the details.';
      setError(errorMessage);
      console.error('Dog registration error:', err.response?.data || err.message);
      setIsSubmitting(false);
    }
    // No need to set isSubmitting false here if navigating away on success
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Register a New Dog</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <DogForm
        onSubmit={handleSubmit}
        submitButtonText="Register Dog"
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default RegisterDogPage;