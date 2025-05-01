import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import reportService from '../services/reportService';
import { useAuth } from '../contexts/AuthContext'; // To check role
import { formatDistanceToNow } from 'date-fns';

// Function to determine status color (Tailwind classes)
const getStatusColor = (status) => {
    switch (status) {
        case 'Open': return 'bg-blue-100 text-blue-800';
        case 'Investigating': return 'bg-yellow-100 text-yellow-800';
        case 'Resolved': return 'bg-green-100 text-green-800';
        case 'Closed': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

function IncidentManagementPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth(); // Needed for role check potentially, though route protects

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await reportService.getAllReports();
        setReports(data);
      } catch (err) {
        setError(`Failed to fetch reports: ${err.response?.data?.message || err.message}`);
        console.error('Fetch all reports error:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    // Fetch only if user has the correct role (double check, route should handle)
    if (user && (user.role === 'Admin' || user.role === 'ShelterStaff')) {
        fetchReports();
    } else {
        setError("You are not authorized to view this page.");
        setLoading(false);
    }
  }, [user]); // Re-check if user changes

  if (loading) return <div className="text-center mt-8">Loading incident reports...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Incident Management</h1>

      {reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dog</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                     <span className={`font-semibold ${report.reportType === 'Lost' ? 'text-red-600' : report.reportType === 'Found' ? 'text-yellow-700' : 'text-blue-600'}`}>
                        {report.reportType}
                     </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.dog ? (
                      <Link to={`/dogs/${report.dog._id}`} className="hover:underline flex items-center">
                        {report.dog.profileImageUrl && <img src={report.dog.profileImageUrl} alt={report.dog.name} className="h-6 w-6 rounded-full mr-2 object-cover"/>}
                        {report.dog.name || 'Unknown Dog'}
                      </Link>
                    ) : (
                      'Dog Not Found'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.reportStatus)}`}>
                      {report.reportStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.reporter ? report.reporter.name : (report.reporterContact?.name || 'Anonymous')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* Link to a details/edit page */}
                    <Link to={`/incidents/${report._id}`} className="text-indigo-600 hover:text-indigo-900">
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default IncidentManagementPage;