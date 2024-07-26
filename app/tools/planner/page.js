'use client'
import { useState, useRef, useContext } from "react";
import { jsPDF } from "jspdf";
import { firestore, doc, setDoc, getDoc, writeBatch } from '@lib/firebase'; // Import Firestore methods from your library
import { UserContext } from '@lib/context'; // Import UserContext to get the user data
import ActionButtons from '@components/ActionButton';
import { gradeLevels } from '@utils/utils'; // Import gradeLevels from utils
import toast from 'react-hot-toast';
import PdfTextExtractor from "@components/PdfTextExtractor";

export default function Planner({ params }) {
    const contentRef = useRef(null);
    const { user, username } = useContext(UserContext); // Get user and username from UserContext

    const [isFormVisible, setIsFormVisible] = useState(true);
    const [result, setResult] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        gradeLevel: "5th-grade",
        content: "",
        additionalContext: "",
        alignedStandard: "",
        pdfText: ""
    });
    const [docId, setDocId] = useState(null); // State to store the document ID

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (event) => {

        console.log("FORM DATA:", formData)
    
        event.preventDefault();
        setIsLoading(true);
        setIsFormVisible(false);
        setError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lesson-planner`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Unknown error occurred');
            }

            const data = await response.json();
            if (!data || Object.keys(data).length === 0) {
                throw new Error('Received empty data');
            }

            setResult(data);
            toast.success('Lesson Plan generated successfully!');

            if (user && username) {
                console.log("SAVING TO FIREBASE");
                console.log("DATA:", data)
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

                if (docId) {
                    toast.success('Updated Generated Plan to history!');
                } else {
                    toast.success('Saved Generated Plan to history!');
                }

                // Update the document ID state only after successful operation
                setDocId(newDocId);

            }

            setIsFormVisible(false);
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error(`Error: ${error.message}`);
            setIsFormVisible(true);
        } finally {
            setIsLoading(false);
        }
    }

    const handleBack = () => {
        setFormData({
            gradeLevel: "5th-grade",
            content: "",
            additionalContext: "",
            alignedStandard: "",
            pdfText: ""
        });
        setIsFormVisible(true);
        setResult(null);
        setDocId(null);
    };

    const handleEditPrompt = () => {
        setIsFormVisible(true);
    };

    const handlePdfTextExtracted = (extractedText, targetField) => {

        setFormData(prevState => ({
            ...prevState,
            [targetField]: prevState[targetField] + (prevState[targetField] ? '\n\n' : '') + extractedText
        }));

    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 space-y-6">
            {isFormVisible && (
                <div className="bg-white shadow rounded-lg overflow-hidden w-full max-w-lg p-6">
                    <div className="flex flex-col space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-bold">Lesson Plan</h1>
                            <div className="flex space-x-2">
                                <button
                                    className="flex items-center text-blue-500"
                                    onClick={() => {
                                        setFormData({
                                            gradeLevel: "5th-grade",
                                            content: "",
                                            additionalContext: "",
                                            alignedStandard: "",
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
                        <p className="text-gray-600">
                            Generate a lesson plan for a topic or objective you’re teaching.
                        </p>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Grade level:
                                </label>
                                <select
                                    name="gradeLevel"
                                    data-tour-id="name-gradeLevel"
                                    required
                                    className="border border-gray-300 rounded-lg w-full h-10 px-2 bg-white"
                                    value={formData.gradeLevel}
                                    onChange={handleChange}
                                >
                                    {gradeLevels.map((grade) => (
                                        <option key={grade.value} value={grade.value}>
                                            {grade.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 flex items-center justify-between">
                                    Topic, Standard or Objective: <PdfTextExtractor onTextExtracted={handlePdfTextExtracted} targetField="content" />
                                </label>
                                <textarea
                                    type="text"
                                    name="content"
                                    data-tour-id="name-content"
                                    required
                                    placeholder="topic, standard, or longer description of what your'e teaching. "
                                    className="border border-gray-300 rounded-lg w-full h-16 px-2 py-2 bg-white"
                                    value={formData.content}
                                    onChange={handleChange}
                                    style={{ verticalAlign: "top", textAlign: "left" }}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Additional Criteria:
                                </label>
                                <textarea
                                    type="text"
                                    name="additionalContext"
                                    data-tour-id="name-additionalContext"
                                    placeholder="Students are in a unit about world regions, students last lesson was on the geography of the United States, have the lesson include group work, etc."
                                    className="border border-gray-300 rounded-lg w-full h-16 px-2 py-2 bg-white"
                                    value={formData.additionalContext}
                                    onChange={handleChange}
                                    style={{ verticalAlign: "top", textAlign: "left" }}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Standards Set to Align to:
                                </label>
                                <input
                                    type="text"
                                    name="alignedStandard"
                                    data-tour-id="name-alignedStandard"
                                    required
                                    placeholder="Any standards worldwide (CCSS, TEKS, Ontario, Florida)"
                                    className="border border-gray-300 rounded-lg w-full h-16 px-2 py-2 bg-white"
                                    value={formData.alignedStandard}
                                    onChange={handleChange}
                                    style={{ verticalAlign: "top", textAlign: "left" }}
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
            )}

            {(result || isLoading || error) && (
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
                                <h1 className="text-xl font-bold">Lesson Plan</h1>
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
                                                    <strong>{key.replace(/([A-Z])/g, ' $1')}:</strong>
                                                    {key === "Objective" ? (
                                                        <p>{result[key]}</p>
                                                    ) : (
                                                        Array.isArray(result[key]) && result[key].map((item, index) => (
                                                            <p key={index} className="mb-2">{item}</p>
                                                        ))
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>


                            <br />

                            <ActionButtons contentRef={contentRef} result={result} docType={'planner'} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
