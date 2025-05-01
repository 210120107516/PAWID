import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import reportService from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';

const validStatuses = ['Open', 'Investigating', 'Resolved', 'Closed'];

function IncidentDetailsPage() {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState('');

    // State for status update form
    const [newStatus, setNewStatus] = useState('');
    const [resolutionDetails, setResolutionDetails] = useState('');

    // Fetch report details - Need an endpoint for single report by ID
    // Let's reuse getAllReports and filter for now, or ideally add a GET /api/reports/:id endpoint
    const fetchReport = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // --- TEMPORARY: Filter from all reports ---
            // Replace this with a dedicated fetchById endpoint later for efficiency
            const allReports = await reportService.getAllReports();
            const foundReport = allReports.find(r => r._id === reportId);
            if (foundReport) {
                setReport(foundReport);
                setNewStatus(foundReport.reportStatus); // Initialize form state
                setResolutionDetails(foundReport.resolutionDetails || '');
            } else {
                setError("Report not found.");
            }
            // --- END TEMPORARY ---

            /* --- IDEAL: Use a dedicated endpoint ---
            // const reportData = await reportService.getReportById(reportId); // Assuming this exists
            // setReport(reportData);
            // setNewStatus(reportData.reportStatus);
            // setResolutionDetails(reportData.resolutionDetails || '');
            */
        } catch (err) {
            setError(`Failed to fetch report details: ${err.response?.data?.message || err.message}`);
            console.error('Fetch report details error:', err);
        } finally {
            setLoading(false);
        }
    }, [reportId]); // Dependency

    useEffect(() => {
        if (user && (user.role === 'Admin' || user.role === 'ShelterStaff')) {
            fetchReport();
        } else {
             setError("You are not authorized to view this page.");
             setLoading(false);
        }
    }, [user, fetchReport]); // Include fetchReport in dependencies

    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setUpdateError('');
        try {
            const statusData = {
                reportStatus: newStatus,
                resolutionDetails: resolutionDetails,
            };
            const updatedReport = await reportService.updateReportStatus(reportId, statusData);
            setReport(updatedReport); // Update local state with returned data
            setNewStatus(updatedReport.reportStatus); // Update form state
            setResolutionDetails(updatedReport.resolutionDetails || '');
            // Optionally show a success message
        } catch (err) {
            setUpdateError(`Failed to update status: ${err.response?.data?.message || err.message}`);
            console.error("Update status error:", err);
        } finally {
            setIsUpdating(false);
        }
    };


    if (loading) return <div className="text-center mt-8">Loading report details...</div>;
    if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;
    if (!report) return <div className="text-center mt-8">Report data could not be loaded.</div>;


    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <Link to="/incidents" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Incident List</Link>
            <h1 className="text-3xl font-bold mb-6">Incident Details</h1>

            <div className="bg-white shadow-lg rounded-lg p-6 mb-8 space-y-4">
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold">Report #{report._id.substring(report._id.length - 6)}</h2>
                     <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(report.reportStatus)}`}>
                        {report.reportStatus}
                    </span>
                </div>
                <p><strong className="font-medium">Type:</strong> {report.reportType}</p>
                <p><strong className="font-medium">Reported:</strong> {format(new Date(report.createdAt), 'PPP p')} ({formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })})</p>

                {/* Dog Info */}
                {report.dog ? (
                     <p><strong className="font-medium">Dog:</strong> <Link to={`/dogs/${report.dog._id}`} className="text-blue-600 hover:underline">{report.dog.name || 'Unknown Dog'}</Link></p>
                ) : ( <p><strong className="font-medium">Dog:</strong> Dog reference missing</p> )}

                {/* Reporter Info */}
                 <div>
                    <strong className="font-medium">Reporter:</strong>
                    {report.reporter ? (
                        <span> {report.reporter.name} ({report.reporter.email || 'No Email'}) - Logged In User</span>
                    ) : report.reporterContact?.contactInfo ? (
                        <span> {report.reporterContact.name || 'Anonymous'} (Contact: {report.reporterContact.contactInfo})</span>
                    ) : (
                        <span> Anonymous (No contact info provided)</span>
                    )}
                 </div>

                 {/* Location */}
                 {report.location && (
                    <p><strong className="font-medium">Location:</strong> {report.location.address || 'Address not provided'}
                        {report.location.coordinates && ` (Coords: ${report.location.coordinates[1]}, ${report.location.coordinates[0]})`}
                    </p>
                 )}

                 {/* Description */}
                 <p><strong className="font-medium">Description:</strong></p>
                 <p className="pl-2 border-l-2 ml-2 text-gray-700 whitespace-pre-wrap">{report.description}</p>

                 {/* Resolution */}
                 {report.reportStatus === 'Resolved' || report.reportStatus === 'Closed' ? (
                     <>
                        <p><strong className="font-medium">Resolution Details:</strong></p>
                        <p className="pl-2 border-l-2 ml-2 text-gray-700 whitespace-pre-wrap">{report.resolutionDetails || 'No details provided.'}</p>
                        {report.resolvedBy && <p className="text-sm text-gray-500">Resolved by User ID: {report.resolvedBy} on {format(new Date(report.resolvedAt), 'PPP p')}</p>}
                     </>
                 ) : null}
            </div>

            {/* --- Update Status Form --- */}
            <div className="bg-gray-50 shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Update Report Status</h3>
                <form onSubmit={handleStatusUpdate} className="space-y-4">
                     {updateError && <p className="text-red-500 text-sm">{updateError}</p>}
                    <div>
                        <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700">New Status</label>
                        <select
                            id="newStatus" name="newStatus" value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)} required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            disabled={isUpdating}
                        >
                            {validStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                     {(newStatus === 'Resolved' || newStatus === 'Closed') && (
                         <div>
                            <label htmlFor="resolutionDetails" className="block text-sm font-medium text-gray-700">Resolution/Closing Details (Optional)</label>
                            <textarea
                                id="resolutionDetails" name="resolutionDetails" value={resolutionDetails}
                                onChange={(e) => setResolutionDetails(e.target.value)} rows={3}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Enter details about how the incident was resolved or why it's being closed."
                                disabled={isUpdating}
                            ></textarea>
                        </div>
                     )}
                     <div>
                        <button
                            type="submit"
                            disabled={isUpdating || newStatus === report.reportStatus} // Disable if no change or updating
                            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? 'Updating...' : 'Update Status'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default IncidentDetailsPage;