import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute, { RoleProtectedRoute } from './components/ProtectedRoute'; // Import protectors
import RegisterDogPage from './pages/RegisterDogPage';
import MyDogsPage from './pages/MyDogsPage';
import DogProfilePage from './pages/DogProfilePage';
import EditDogPage from './pages/EditDogPage'; 
import PublicDogViewPage from './pages/PublicDogViewPage'; 
import ReportIncidentPage from './pages/ReportIncidentPage';
import IncidentManagementPage from './pages/IncidentManagementPage';
import IncidentDetailsPage from './pages/IncidentDetailsPage';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/scan/:uniqueSecureId" element={<PublicDogViewPage />} />
          <Route path="/report/:dogId" element={<ReportIncidentPage />} /> {/* Add report route */}

          {/* Add PublicDogViewPage later */}

          {/* Protected Routes (Require Login) */}
          <Route element={<ProtectedRoute />}> {/* Wrap protected routes */}
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* --- Dog Management Routes --- */}
            <Route path="/register-dog" element={<RegisterDogPage />} />
            <Route path="/my-dogs" element={<MyDogsPage />} />
            <Route path="/dogs/:id" element={<DogProfilePage />} />
            <Route path="/dogs/edit/:id" element={<EditDogPage />} /> {/* Add Edit route */}
          </Route>

          {/* --- Role Protected Routes (Admin/ShelterStaff) --- */}
          <Route element={<RoleProtectedRoute allowedRoles={['Admin', 'ShelterStaff']} />}>
            <Route path="/incidents" element={<IncidentManagementPage />} />
            <Route path="/incidents/:reportId" element={<IncidentDetailsPage />} />
          </Route>


          {/* Catch-all for Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer className="bg-gray-700 text-white text-center p-4 mt-auto">
         © {new Date().getFullYear()} Secure Dog ID System. All rights reserved.
      </footer>
    </div>
  );
}

// Simple NotFoundPage component (can be moved to pages/ later)
const NotFoundPage = () => (
    <div className="text-center">
        <h1 className="text-2xl font-bold">404 - Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <Link to="/" className="text-blue-500 hover:underline">Go Home</Link>
    </div>
);


export default App;