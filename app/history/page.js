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
        console.log("RESULTS SNAPSHOTS:", resultsSnapshot)
        const resultsList = resultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setResults(resultsList);
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
        <ul>
          {results.map(result => (
            <li key={result.id} className="mb-4 p-4 bg-white shadow rounded-lg">
              <h2 className="text-xl font-semibold">Result on {new Date(result.id).toLocaleString()}</h2>
              <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(result, null, 2)}</pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
