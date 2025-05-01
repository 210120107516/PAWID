import React from 'react';
import { useAuth } from '../contexts/AuthContext'; // Use the hook

function HomePage() {
  const { user } = useAuth(); // Get user from context

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to the Secure Dog ID System</h1>
      {user ? (
        <p className="text-lg">Hello, {user.name}! You are logged in as a {user.role}.</p>
      ) : (
        <p className="text-lg">Please log in or register to manage dog identities.</p>
      )}
      {/* Add more content or links here */}
    </div>
  );
}

export default HomePage;