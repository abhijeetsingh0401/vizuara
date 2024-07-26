"use client";
import { useEffect, useState, useContext } from "react";
import { useRouter } from 'next/navigation';
import { firestore, collection, getDocs, deleteDoc, doc } from '@lib/firebase'; // Import Firestore methods from your library
import { UserContext } from '@lib/context'; // Import UserContext to get the user data
import toast from 'react-hot-toast';

export default function History() {
  const { user, username } = useContext(UserContext); // Get user and username from UserContext
  const router = useRouter(); // Get router from next/navigation

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("User:", user);
    console.log("Username:", username);

    // Redirect to /enter page if the user is not logged in
    // if (!user) {
    //   router.push('/enter');
    //   return;
    // }

    const fetchResults = async () => {
      try {
        const resultsCollection = collection(firestore, `history/${username}/results`);
        const resultsSnapshot = await getDocs(resultsCollection);
        console.log("RESULTS SNAPSHOTS:", resultsSnapshot);
        const resultsList = resultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setResults(resultsList);
        console.log("RESULTS LIST:", resultsList)
      } catch (error) {
        console.error("Error fetching results: ", error);
        setError("Failed to load results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchResults();
    } else {
      setLoading(false);
    }
  }, [user, username, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const deleteResult = async (resultId) => {
    try {
      console.log(`Attempting to delete document at path: history/${username}/results/${resultId}`);
      const docRef = doc(firestore, `history/${username}/results`, resultId);
      console.log('Document Reference:', docRef);
      await deleteDoc(docRef);
      toast.success('Deleted');
      setResults(results.filter(result => result.id !== resultId));
    } catch (error) {
      toast.error('Cannot delete');
      console.error("Error deleting result: ", error);
      setError("Failed to delete the result. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Your History</h1>
      {results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Delete</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map(result => (
                <tr key={result.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <a href={`/tools/youtube/${result.id}`} className="text-sm font-medium text-blue-600 hover:underline">{result.result.Title}</a>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(result.id.split(':').slice(1).join(':')).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => deleteResult(result.id)} className="text-gray-400 hover:text-gray-600">
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"></path>
                      </svg>
                    </button>
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
