import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthForm from '../components/AuthForm'; // Reusable form

function LoginPage() {
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    setError(''); // Clear previous errors
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard'); // Redirect to dashboard after successful login
    } catch (err) {
      // Handle specific errors from backend if available
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      console.error("Login error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <AuthForm onSubmit={handleLogin} submitButtonText="Login" />
      <p className="mt-4 text-center text-sm">
        Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Register here</Link>
      </p>
    </div>
  );
}

export default LoginPage;