'use client';
import { useState, useRef, useEffect, useContext } from 'react';
import { jsPDF } from 'jspdf';
import { firestore, doc, setDoc, writeBatch } from '@lib/firebase'; // Import Firestore methods from your library
import { UserContext } from '@lib/context'; // Import UserContext to get the user data
import { useRouter } from 'next/navigation';
import ActionButtons from '@components/ActionButton';
import toast from 'react-hot-toast';

export default function Rewrite() {
    const contentRef = useRef(null);
    const { user, username } = useContext(UserContext); // Get user and username from UserContext
    const router = useRouter(); // Get router from next/navigation

    const [isFormVisible, setIsFormVisible] = useState(true);
    const [result, setResult] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        originalText: '',
        pdfText: ''
    });
    const [docId, setDocId] = useState(null); // State to store the document ID
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [pdfjsLib, setPdfjsLib] = useState(null);

    useEffect(() => {
        // Redirect to /enter page if the user is not logged in
        if (!user) {
            router.push('/enter');
        }
    }, [user, router]);

    useEffect(() => {
        // Dynamically import pdfjs-dist
        import('pdfjs-dist/webpack').then((module) => {
            setPdfjsLib(module);
        });
    }, []);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            if (!pdfjsLib) {
                console.error('PDF.js library is not loaded yet.');
                return;
            }
            setLoading(true);
            const reader = new FileReader();
            reader.onload = async () => {
                const typedarray = new Uint8Array(reader.result);
                const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
                let extractedText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item) => item.str).join(' ');
                    extractedText += pageText + '\n';
                }
                setText(extractedText);
                setFormData({ ...formData, pdfText: extractedText });
                console.log('EXTRACTED DATA:', extractedText);
                setLoading(false);
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert('Please upload a PDF file.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setIsFormVisible(false);
        setError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/proof-reader`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            console.log('formData:', formData);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Unknown error occurred');
            }

            const data = await response.json();
            // Check for valid data
            if (!data || !data.Title) {
                toast.success('Received empty or invalid data');
            }

            setResult(data);

            // Save the result to Firestore along with formData using username from context
            if (user && username) {
                console.log('SAVING TO FIREBASE');
                const batch = writeBatch(firestore);

                // Use the existing docId if it exists, otherwise generate a new one
                const newDocId = `${data.Title}:${new Date().toISOString()}`;
                const newResultDocRef = doc(firestore, `history/${username}/results/${newDocId}`);

                // Create the new document
                batch.set(newResultDocRef, { formData, result: data });

                // Delete the old document if docId exists
                if (docId) {
                    const oldResultDocRef = doc(firestore, `history/${username}/results/${docId}`);
                    batch.delete(oldResultDocRef);
                }

                // Commit the batch operation
                await batch.commit();

                if(docId){
                    toast.success('Updated Proof Reader Result saved to history!');
                }else{
                    toast.success('Generated Proof Reader Result saved to history!');
                }

                // Update the document ID state only after successful operation
                setDocId(newDocId);

            }

            setIsFormVisible(false);
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error(`Error: ${error.message}`);
            setIsFormVisible(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setFormData({
            originalText: '',
            pdfText: ''
        });
        setIsFormVisible(true);
        setResult(null);
        setDocId(null);
    };

    const handleEditPrompt = () => {
        setIsFormVisible(true);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            {isFormVisible ? (
                <div className="bg-white shadow rounded-lg overflow-hidden w-full max-w-3xl p-6">
                    {" "}
                    <div className="flex flex-col space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-bold">Proof Reader</h1>
                            <div className="flex space-x-2">
                                <button
                                    className="flex items-center text-blue-500"
                                    onClick={() => {
                                        setFormData({
                                            originalText: "",
                                            pdfText: ""
                                        });
                                        setDocId(null);
                                    }}
                                >
                                    <svg
                                        className="h-5 w-5 mr-1"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z"></path>
                                    </svg>
                                    Clear inputs
                                </button>
                            </div>
                        </div>
                        <p className="text-gray-600">Take any text and have it proofread, correcting grammar, spelling, punctuation and adding clarity.</p>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Original Text:
                                </label>
                                <input
                                    type="text"
                                    name="originalText"
                                    data-tour-id="name-originalText"
                                    required
                                    placeholder="Paste the original text"
                                    className="border border-gray-300 rounded-lg w-full h-16 px-2 py-2 bg-white"
                                    value={formData.originalText}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-500 text-white rounded-lg py-2"
                                >
                                    Generate
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden w-full max-w-lg p-6 animate-blurIn">
                    {isLoading ? (
                        <div className="flex justify-center items-center">
                            <img src='/bouncing-circles.svg' alt="Loading" className="w-16 h-16" />
                        </div>
                    ) : error ? (
                        <div className="text-red-500">{error}</div>
                    ) : (
                        <div>
                            <div className="flex items-center justify-between">
                                <button
                                    className="text-blue-500"
                                    onClick={handleBack}
                                >
                                    Back
                                </button>
                                <h1 className="text-xl font-bold">Proof Reader Result</h1>
                                <button
                                    className="text-blue-500"
                                    onClick={handleEditPrompt}
                                >
                                    Edit
                                </button>
                            </div>

                            <br />

                            <div ref={contentRef} className="markdown-content" id="md-content-63484949">
                                {result && (
                                    <div>
                                        {result.Title && (
                                            <h1 style={{ marginBottom: '1rem' }}><strong>{result.Title}</strong></h1>
                                        )}
                                        {Object.keys(result).map((key) =>
                                            key !== "Title" && (
                                                <div key={key} style={{ marginBottom: '1rem' }}>
                                                    {result[key].subTitle && (
                                                        <div>
                                                            <p><strong>{result[key].subTitle}:</strong></p>
                                                            {Array.isArray(result[key].array) && result[key].array.map((item, index) => (
                                                                <p key={index} className="mb-2">{item}</p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            <br />

                            <ActionButtons contentRef={contentRef} result={result} docType={'proof-reader'} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
