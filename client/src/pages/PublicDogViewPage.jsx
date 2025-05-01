import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios"; // Use axios directly for public endpoint

// Simple fallback image URL
const FALLBACK_IMAGE_URL =
  "https://via.placeholder.com/200/CCCCCC/FFFFFF?text=No+Image";
const API_BASE_URL =
  `${import.meta.env.VITE_API_URL}/dogs` || "http://localhost:4000/api/dogs";

function PublicDogViewPage() {
  const [dogInfo, setDogInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { uniqueSecureId } = useParams(); // Get ID from URL

  useEffect(() => {
    const fetchPublicDogInfo = async () => {
      setLoading(true);
      setError("");
      if (!uniqueSecureId) {
        setError("Invalid scan link.");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `${API_BASE_URL}/scan/${uniqueSecureId}`
        );
        setDogInfo(response.data);
      } catch (err) {
        setError(
          `Could not retrieve information: ${
            err.response?.data?.message || err.message
          }`
        );
        console.error(
          "Fetch public dog info error:",
          err.response?.data || err.message
        );
        if (err.response?.status === 404) {
          setError(
            "This dog identification tag is invalid or the dog profile was removed."
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPublicDogInfo();
  }, [uniqueSecureId]);

  if (loading)
    return <div className="text-center mt-10 p-5">Loading Information...</div>;
  if (error)
    return (
      <div className="text-center mt-10 p-5 text-red-600 bg-red-100 rounded border border-red-300">
        {error}
      </div>
    );
  if (!dogInfo)
    return (
      <div className="text-center mt-10 p-5">No information available.</div>
    );

  // Determine alert status for display
  const isLost = dogInfo.status === "Lost";
  const isFound = dogInfo.status === "Found"; // Could be 'Stray' or 'Found' depending on flow

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <div
        className={`bg-white shadow-xl rounded-lg overflow-hidden border-t-8 ${
          isLost
            ? "border-red-500"
            : isFound
            ? "border-yellow-500"
            : "border-blue-500"
        }`}
      >
        {isLost && (
          <div className="bg-red-500 text-white text-center p-3 font-bold">
            !! URGENT: This dog is reported LOST !!
          </div>
        )}
        {isFound && ( // Or check for 'Stray' status as well if needed
          <div className="bg-yellow-500 text-black text-center p-3 font-bold">
            !! This dog has been reported FOUND / STRAY !!
          </div>
        )}

        <div className="p-6 text-center">
          <img
            src={dogInfo.profileImageUrl || FALLBACK_IMAGE_URL}
            alt={`Picture of ${dogInfo.name || "the dog"}`}
            className="w-32 h-32 md:w-48 md:h-48 rounded-full mx-auto mb-4 object-cover border-4 border-gray-200 shadow-sm"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = FALLBACK_IMAGE_URL;
            }}
          />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
            {dogInfo.name || "Name Not Available"}
          </h1>
          <p className="text-md text-gray-600 mb-4">
            {dogInfo.breed || "Unknown Breed"}
          </p>

          <div className="text-left space-y-2 text-gray-700 border-t pt-4">
            {dogInfo.color && (
              <p>
                <strong className="font-medium">Color:</strong> {dogInfo.color}
              </p>
            )}
            {dogInfo.description && (
              <p>
                <strong className="font-medium">Description:</strong>{" "}
                {dogInfo.description}
              </p>
            )}
            <p>
              <strong className="font-medium">Current Status:</strong>{" "}
              <span className="font-semibold">{dogInfo.status}</span>
            </p>
            {dogInfo.registeredDate && (
              <p className="text-sm text-gray-500">
                Profile created:{" "}
                {new Date(dogInfo.registeredDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons - Link to future reporting pages */}
        <div className="bg-gray-50 p-4 border-t flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-3">
          {isLost ? (
            <Link
              to={`/report/${dogInfo._id}?type=Found`} // Link to ReportIncidentPage with type=Found
              className="w-full sm:w-auto text-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              I Found This Dog!
            </Link>
          ) : (
            (dogInfo.status === "Pet" || dogInfo.status === "Adopted") && (
              <Link
                to={`/report/${dogInfo._id}?type=Lost`} // Link to ReportIncidentPage with type=Lost (will require login)
                className="w-full sm:w-auto text-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Report This Dog Lost
              </Link>
            )
          )}

          <Link
            // Generic Report button
            to={`/report/${dogInfo._id}?type=Sighting`} // Example: default to Sighting or Other
            className="w-full sm:w-auto text-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Report Sighting/Other
          </Link>

          {/* General Contact/Login Link */}
          <Link
                    to={`/login?redirect=/dogs/${dogInfo._id}`} // Keep owner login link
                    className="w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                    Owner Login / More Info
                 </Link>
          {/* Consider adding a generic "Report Incident" link */}
          {/* <Link to={`/report-incident/${dogInfo._id}`} className="...">Report Other Issue</Link> */}
        </div>
      </div>
    </div>
  );
}

export default PublicDogViewPage;
