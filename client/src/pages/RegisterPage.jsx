import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthForm from '../components/AuthForm'; // Reusable form

function RegisterPage() {
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (formData) => {
     setError(''); // Clear previous errors
    if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
    }
    try {
      // Assuming default role 'Owner' for now, or add role selection to form
      await register(formData.name, formData.email, formData.password);
      navigate('/dashboard'); // Redirect after successful registration
    } catch (err) {
       const errorMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed. Please try again.';
       setError(errorMessage);
       console.error("Registration error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {/* Add 'name' and 'confirmPassword' fields to AuthForm props */}
      <AuthForm
        onSubmit={handleRegister}
        submitButtonText="Register"
        showNameField={true}
        showConfirmPasswordField={true}
      />
       <p className="mt-4 text-center text-sm">
        Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login here</Link>
      </p>
    </div>
  );
}

export default RegisterPage;