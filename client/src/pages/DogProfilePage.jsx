import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import dogService from "../services/dogService";
import { useAuth } from "../contexts/AuthContext"; // To check ownership/role
import QRCodeDisplay from "../components/QRCodeDisplay";
import reportService from "../services/reportService"; // Import report service
import { formatDistanceToNow } from "date-fns";

// Simple fallback image URL
const FALLBACK_IMAGE_URL =
  "https://via.placeholder.com/300/CCCCCC/FFFFFF?text=No+Image";

function DogProfilePage() {
  const [dog, setDog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportsError, setReportsError] = useState("");
  const { id } = useParams(); // Get dog ID from URL
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDogAndReports = async () => {
      setLoading(true);
      setLoadingReports(true);
      setError("");
      setReportsError("");
      try {
        // Fetch dog details (as before)
        const dogData = await dogService.getDogById(id);
        setDog(dogData);

        // Fetch reports for this dog (only if authorized)
        try {
          const reportData = await reportService.getReportsForDog(id);
          setReports(reportData);
        } catch (reportErr) {
          // Handle cases where user can see dog but not reports (if roles differ)
          if (
            reportErr.message.includes("Authentication") ||
            reportErr.response?.status === 403
          ) {
            console.warn("Not authorized to view reports for this dog.");
            setReportsError("You are not authorized to view reports."); // Or hide section
          } else {
            setReportsError(`Failed to fetch reports: ${reportErr.message}`);
          }
          console.error(
            "Fetch reports error:",
            reportErr.response?.data || reportErr.message
          );
        }
      } catch (err) {
        // Handle dog fetch errors (as before)
        setError(
          `Failed to fetch dog details: ${
            err.response?.data?.message || err.message
          }`
        );
        console.error(
          "Fetch dog by ID error:",
          err.response?.data || err.message
        );
        // ... (error handling as before)
      } finally {
        setLoading(false);
        setLoadingReports(false);
      }
    };

    if (id && user) {
      fetchDogAndReports();
    } else if (!user) {
      setError("Please log in to view dog profiles.");
      setLoading(false);
    }
  }, [id, user]); // Refetch if ID or user changes

  const handleDelete = async () => {
    if (
      !dog ||
      !window.confirm(
        `Are you sure you want to delete ${dog.name}? This is permanent.`
      )
    ) {
      return;
    }
    try {
      await dogService.deleteDog(dog._id);
      navigate("/my-dogs"); // Redirect after successful deletion
    } catch (err) {
      setError(
        `Failed to delete dog: ${err.response?.data?.message || err.message}`
      );
      console.error("Delete dog error:", err.response?.data || err.message);
    }
  };

  // Determine if the current user can edit/delete this dog
  const canManage =
    user && dog && (user._id === dog.owner._id || user.role === "Admin");

  if (loading)
    return <div className="text-center mt-8">Loading dog profile...</div>;
  if (error)
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  if (!dog)
    return (
      <div className="text-center mt-8">Dog details could not be loaded.</div>
    ); // Should be caught by error state mostly

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden md:flex">
        <div className="md:w-1/3">
          <img
            src={dog.profileImageUrl || FALLBACK_IMAGE_URL}
            alt={`Profile of ${dog.name}`}
            className="w-full h-64 md:h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = FALLBACK_IMAGE_URL;
            }}
          />
        </div>
        <div className="p-6 md:w-2/3">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{dog.name}</h1>
              <p className="text-md text-gray-600">
                {dog.breed || "Unknown Breed"}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold
                     ${
                       dog.status === "Lost"
                         ? "bg-red-100 text-red-800"
                         : dog.status === "Found"
                         ? "bg-yellow-100 text-yellow-800"
                         : dog.status === "Adopted"
                         ? "bg-green-100 text-green-800"
                         : "bg-blue-100 text-blue-800"
                     }`}
            >
              {dog.status}
            </span>
          </div>

          <div className="space-y-3 text-gray-700">
            {dog.age !== undefined && (
              <p>
                <strong className="font-medium">Age:</strong> {dog.age} years
              </p>
            )}
            {dog.color && (
              <p>
                <strong className="font-medium">Color:</strong> {dog.color}
              </p>
            )}
            {dog.description && (
              <p>
                <strong className="font-medium">Description:</strong>{" "}
                {dog.description}
              </p>
            )}
            <p>
              <strong className="font-medium">Registered By:</strong>{" "}
              {dog.owner?.name || "N/A"} ({dog.owner?.email || "N/A"})
            </p>
            {/* Add more fields as needed: Registered Date, Last Updated */}
            <p className="text-xs text-gray-500">
              Registered on: {new Date(dog.createdAt).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-500">
              Last updated: {new Date(dog.updatedAt).toLocaleDateString()}
            </p>
          </div>

          {/* --- QR Code Section --- */}
          <div className="mt-6 pt-4 border-t">
            <h3 className="text-lg font-semibold mb-2">
              Digital ID Tag (QR Code)
            </h3>
            {dog.uniqueSecureId ? (
              <QRCodeDisplay uniqueSecureId={dog.uniqueSecureId} size={160} />
            ) : (
              <p className="text-sm text-orange-600">
                QR Code ID not generated for this dog yet.
              </p>
              // Potentially add a button for admins/owners to generate one if missing
            )}
          </div>

          {/* --- Management Actions --- */}
          {canManage && (
            <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
              <Link
                to={`/dogs/edit/${dog._id}`}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded text-sm transition duration-300"
              >
                Edit Profile
              </Link>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded text-sm transition duration-300"
              >
                Delete Dog
              </button>
            </div>
          )}
        </div>
      </div>
      {/* --- Related Reports Section --- */}
      <div className="mt-8 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3">Related Reports</h2>
        {loadingReports && <p>Loading reports...</p>}
        {reportsError && <p className="text-sm text-red-500">{reportsError}</p>}
        {!loadingReports && !reportsError && reports.length === 0 && (
          <p className="text-sm text-gray-600">
            No reports found for this dog.
          </p>
        )}
        {!loadingReports && !reportsError && reports.length > 0 && (
          <ul className="space-y-4">
            {reports.map((report) => (
              <li key={report._id} className="border-b pb-3 last:border-b-0">
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`font-semibold ${
                      report.reportType === "Lost"
                        ? "text-red-600"
                        : report.reportType === "Found"
                        ? "text-yellow-700"
                        : "text-blue-600"
                    }`}
                  >
                    {report.reportType}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(report.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-800 mb-1">
                  {report.description}
                </p>
                {report.location?.address && (
                  <p className="text-xs text-gray-500">
                    Location: {report.location.address}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Status:{" "}
                  <span className="font-medium">{report.reportStatus}</span>
                </p>
                {report.reporter ? (
                  <p className="text-xs text-gray-500">
                    Reported by: {report.reporter.name} ({report.reporter.role})
                  </p>
                ) : report.reporterContact?.name ? (
                  <p className="text-xs text-gray-500">
                    Reported by: {report.reporterContact.name} (Contact:{" "}
                    {report.reporterContact.contactInfo || "Not Provided"})
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Reported by: Anonymous
                  </p>
                )}
                {/* Add link/button to manage report status in Phase 5 */}
              </li>
            ))}
          </ul>
        )}
        {/* Optional: Add button to report new incident from profile page */}
        <Link to={`/report/${dog._id}?type=Other`} className="mt-4 inline-block text-blue-600 hover:underline">Report New Incident</Link>
      </div>

      {/* Placeholder for related reports/incidents (Phase 4/5) */}
      <div className="mt-8 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3">Related Reports</h2>
        <p className="text-sm text-gray-600">
          [Emergency reports related to this dog will appear here in Phase 4]
        </p>
      </div>
    </div>
  );
}

export default DogProfilePage;
