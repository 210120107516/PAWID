import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dogService from '../services/dogService';
import DogCard from '../components/DogCard';
import { useAuth } from '../contexts/AuthContext';

function MyDogsPage() {
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchMyDogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await dogService.getMyDogs();
      setDogs(data);
    } catch (err) {
      setError('Failed to fetch your dogs. Please try again later.');
      console.error('Fetch my dogs error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) { // Only fetch if user is logged in
        fetchMyDogs();
    } else {
        setError("Please log in to view your dogs.");
        setLoading(false);
    }
  }, [user]); // Refetch if user changes (e.g., logs out and back in)

  const handleDeleteDog = async (dogId) => {
      // Optimistic UI update (optional): remove dog from state immediately
      // setDogs(prevDogs => prevDogs.filter(dog => dog._id !== dogId));
      setError(''); // Clear previous errors
      try {
          await dogService.deleteDog(dogId);
          // Refetch the list to confirm deletion from backend
          fetchMyDogs();
          // Or filter state if optimistic update wasn't done:
          // setDogs(prevDogs => prevDogs.filter(dog => dog._id !== dogId));
      } catch (err) {
          setError(`Failed to delete dog: ${err.response?.data?.message || err.message}`);
          console.error("Delete dog error:", err.response?.data || err.message);
          // Optional: If optimistic update was done, refetch to revert if deletion failed
          // fetchMyDogs();
      }
  }

  if (loading) return <div className="text-center mt-8">Loading your dogs...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Registered Dogs</h1>
        <Link
          to="/register-dog"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          + Register New Dog
        </Link>
      </div>

      {dogs.length === 0 ? (
        <p className="text-center text-gray-600">You haven't registered any dogs yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {dogs.map(dog => (
            <DogCard key={dog._id} dog={dog} onDelete={handleDeleteDog} />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyDogsPage;