"use client";
import { useEffect, useState, useContext } from "react";
import { useRouter } from 'next/navigation';
import { firestore, collection, getDocs } from '@lib/firebase'; // Import Firestore methods from your library
import { UserContext } from '@lib/context'; // Import UserContext to get the user data

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shared</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map(result => (
                <tr key={result.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <a href={`/tools/youtube/${result.id}`} className="text-sm font-medium text-blue-600 hover:underline">{result.formData.questionTypes} Quiz</a>
                      <div className="ml-2">
                        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"></path>
                        </svg>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(result.id).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2m0 15-5-2.18L7 18V5h10z"></path>
                      </svg>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2m-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2m3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1z"></path>
                      </svg>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="flex items-center px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600">
                      <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                        <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
                      </svg>
                      Preview
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-gray-400 hover:text-gray-600">
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
