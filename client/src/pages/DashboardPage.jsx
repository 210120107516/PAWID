import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    // This shouldn't happen if ProtectedRoute is used, but good practice
    return <p>Loading or not authorized...</p>;
  }
  // Define checks based on role (or permissions if using client-side util)
  const canManageDogs = user.role === 'Owner' || user.role === 'Admin' || user.role === 'ShelterStaff';
  // const canManageDogs = clientHasPermission(user.role, PERMISSIONS.CREATE_DOG); // Example using util

  const canManageIncidents = user.role === 'Admin' || user.role === 'ShelterStaff';
  // const canManageIncidents = clientHasPermission(user.role, PERMISSIONS.VIEW_ALL_REPORTS);


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-lg mb-6">Welcome back, {user.name} ({user.role})!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {canManageDogs && (
            <div className="p-4 bg-white rounded shadow">
                <h2 className="text-xl font-semibold mb-2">Manage Dogs</h2>
                <p className="text-sm mb-4">Register new dogs or view existing ones.</p>
                <Link to="/my-dogs" className="text-blue-500 hover:underline mr-4">My Dogs</Link>
                <Link to="/register-dog" className="text-blue-500 hover:underline">Register New Dog</Link>
            </div>
         )}
         {canManageIncidents && (
             <div className="p-4 bg-white rounded shadow">
                <h2 className="text-xl font-semibold mb-2">Incident Reports</h2>
                <p className="text-sm mb-4">View and manage reported incidents.</p>
                <Link to="/incidents" className="text-blue-500 hover:underline">View Incidents</Link>
            </div>
         )}
         {/* Add more cards based on role/permissions */}
      </div>
    </div>
  );
}

export default DashboardPage;