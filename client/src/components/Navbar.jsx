import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold hover:text-gray-300">
          Dog ID System
        </Link>
        <div className="space-x-4">
          <Link to="/" className="hover:text-gray-300">Home</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-gray-300">Dashboard</Link>
              {/* Show My Dogs only if user is likely Owner/Staff/Admin */}
              {(user.role === 'Owner' || user.role === 'ShelterStaff' || user.role === 'Admin') && (
                 <Link to="/my-dogs" className="hover:text-gray-300">My Dogs</Link>
              )}
               {/* Show Incident Management only for Staff/Admin */}
              {(user.role === 'Admin' || user.role === 'ShelterStaff') && (
                 <Link to="/incidents" className="hover:text-gray-300">Incidents</Link>
              )}
              <span className="text-gray-400">({user.name} - {user.role})</span>
              <button onClick={handleLogout} /* ... */ >Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300">Login</Link>
              <Link to="/register" className="hover:text-gray-300">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;