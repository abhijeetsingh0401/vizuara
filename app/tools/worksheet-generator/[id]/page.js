'use client'
import { useState, useRef, useContext, useEffect } from "react";
import { jsPDF } from "jspdf";
import { firestore, doc, setDoc, getDoc, writeBatch } from '@lib/firebase'; // Import Firestore methods from your library
import { UserContext } from '@lib/context'; // Import UserContext to get the user data
import { useRouter } from 'next/navigation';
import ActionButtons from '@components/ActionButton';
import { gradeLevels, numberOfQuestions } from '@utils/utils'; // Import gradeLevels from utils
import toast from 'react-hot-toast';
import PdfTextExtractor from "@components/PdfTextExtractor";

export default function WorksheetGenerator({ params }) {
    const contentRef = useRef(null);
    const { user, username } = useContext(UserContext); // Get user and username from UserContext
    const { id } = params;

    const [isFormVisible, setIsFormVisible] = useState(true);
    const [result, setResult] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        gradeLevel: "5th-grade",
        numberOfQuestions: 3,
        questionTypes: "Worksheet - Fill in the blanks",
        hardQuestions: 1,
        mediumQuestions: 1,
        easyQuestions: 1,
        questionText: "",
        pdfText: ""
    });
    const [docId, setDocId] = useState(null); // State to store the document ID

    useEffect(() => {
        const fetchData = async () => {
          if (!username || !id) return;
    
          const decodedTimestamp = decodeURIComponent(id);
          console.log("decodedTimeStamp:",decodedTimestamp)
          
          try {
            const docRef = doc(firestore, `history/${username}/results/${decodedTimestamp}`);
            const docSnap = await getDoc(docRef);
    
            //console.log(typeof id, id)
    
            if (docSnap.exists()) {
              const data = docSnap.data();
              setFormData(data.formData);
              setResult(data.result);
              console.log("DATA:", data);
              setIsFormVisible(false)
            } else {
              console.log("No such document!");
            }
          } catch (error) {
            console.error("Error fetching document: ", error);
            setError("Failed to load data. Please try again.");
          } finally {
            setIsLoading(false);
          }
        };
    
        fetchData();
      }, [username, id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSliderChange = (type, value) => {
        const totalQuestions = formData.numberOfQuestions;
        const otherTypes = {
            hard: ["medium", "easy"],
            medium: ["hard", "easy"],
            easy: ["hard", "medium"],
        };

        const otherSliders = otherTypes[type];

        // Ensure value does not exceed totalQuestions
        if (value > totalQuestions) {
            value = totalQuestions;
        }

        let remainingQuestions = totalQuestions - value;

        // Get the current values of the other sliders
        let otherValues = otherSliders.map(slider => formData[`${slider}Questions`]);

        // Calculate the new values for the other sliders
        if (remainingQuestions >= 0) {
            let newOtherValues = otherValues.map((v, i) => {
                if (remainingQuestions <= 0) {
                    return 0;
                }
                let newValue = Math.floor(remainingQuestions / (otherValues.length - i));
                remainingQuestions -= newValue;
                return newValue;
            });

            setFormData({
                ...formData,
                [`${type}Questions`]: value,
                [`${otherSliders[0]}Questions`]: newOtherValues[0],
                [`${otherSliders[1]}Questions`]: newOtherValues[1],
            });
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setIsFormVisible(false);
        setError(null);

        console.log("FORM DATA:", formData)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/worksheet-generator`, {
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
            // Check for valid data
            console.log("DATA:", data)
            if (!data || !data.Title) {
                toast.success('Received empty or invalid data');
            }

            setResult(data);
            console.log("DATA:", data)

            if (user && username) {
                console.log("SAVING TO FIREBASE");

                const batch = writeBatch(firestore);

                // Use the existing docId if it exists, otherwise generate a new one
                const newDocId = `${data.Title}:${new Date().toISOString()}`;
                const newResultDocRef = doc(firestore, `history/${username}/results/${newDocId}`);

                // Create the new document
                batch.set(newResultDocRef, { formData, result: data, toolUrl: 'worksheet-generator' });

                // Delete the old document if docId exists
                if (docId) {
                    const oldResultDocRef = doc(firestore, `history/${username}/results/${docId}`);
                    batch.delete(oldResultDocRef);
                }

                if (docId) {
                    toast.success('Updated Worksheet Generated Questions to History!');
                } else {
                    toast.success('Saved Worksheet Generated Questions to History!');
                }
                // Commit the batch operation
                await batch.commit();

                // Update the document ID state only after successful operation
                setDocId(newDocId);

            }

            setIsFormVisible(true);
        } catch (error) {
            console.log("FORM DATA:", formData)
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
            numberOfQuestions: 3,
            questionTypes: "Worksheet - Fill in the blanks",
            hardQuestions: 1,
            mediumQuestions: 1,
            easyQuestions: 1,
            questionText: "",
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
                            <h1 className="text-xl font-bold">WorksheetGenerator</h1>
                            <div className="flex space-x-2">
                                <button
                                    className="flex items-center text-blue-500"
                                    onClick={() => {
                                        setFormData({
                                            gradeLevel: "5th-grade",
                                            numberOfQuestions: 3,
                                            questionTypes: "Worksheet - Fill in the blanks",
                                            hardQuestions: 1,
                                            mediumQuestions: 1,
                                            easyQuestions: 1,
                                            questionText: "",
                                            pdfText: ""
                                        });
                                        setDocId(null)
                                    }
                                    }
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
                            Generate guiding questions aligned to a YouTube video.
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
                                <label className="block text-sm font-medium text-gray-700">
                                    Number of Questions:
                                </label>
                                <select
                                    name="numberOfQuestions"
                                    data-tour-id="name-numberOfQuestions"
                                    required
                                    className="border border-gray-300 rounded-lg w-full h-10 px-2 bg-white"
                                    value={formData.numberOfQuestions}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value, 10);
                                        setFormData({
                                            ...formData,
                                            numberOfQuestions: value,
                                            hardQuestions: Math.floor(value / 3),
                                            mediumQuestions: Math.floor(value / 3),
                                            easyQuestions: value - 2 * Math.floor(value / 3),
                                        });
                                    }}
                                >
                                    {numberOfQuestions.map((number) => (
                                        <option key={number.value} value={number.value}>
                                            {number.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Hard Questions:
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max={formData.numberOfQuestions}
                                    value={formData.hardQuestions}
                                    onChange={(e) => handleSliderChange("hard", parseInt(e.target.value, 10))}
                                />
                                <span>{formData.hardQuestions}</span>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Medium Questions:
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max={formData.numberOfQuestions}
                                    value={formData.mediumQuestions}
                                    onChange={(e) => handleSliderChange("medium", parseInt(e.target.value, 10))}
                                />
                                <span>{formData.mediumQuestions}</span>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Easy Questions:
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max={formData.numberOfQuestions}
                                    value={formData.easyQuestions}
                                    onChange={(e) => handleSliderChange("easy", parseInt(e.target.value, 10))}
                                />
                                <span>{formData.easyQuestions}</span>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 flex items-center justify-between">
                                    Topic or Text: <PdfTextExtractor onTextExtracted={handlePdfTextExtracted} targetField="questionText" />
                                </label>
                                <textarea
                                    type="text"
                                    name="questionText"
                                    data-tour-id="name-questionText"
                                    required
                                    placeholder="Insert the text you want to generate worksheet questions for."
                                    className="border border-gray-300 rounded-lg w-full h-16 px-2 py-2 bg-white"
                                    value={formData.questionText}
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

            {(result || isLoading) && (
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
                                <h1 className="text-xl font-bold">Worksheet Question</h1>
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
                                        <h2 className="text-xl font-bold mb-4">{result.Title}</h2>

                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold mb-2">About</h3>
                                            {result.About.map((item, index) => (
                                                <p key={index} className="mb-2">{item}</p>
                                            ))}
                                        </div>

                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold mb-4">Questions</h3>

                                            <h4 className="text-md font-semibold mb-2">Fill in the Blanks</h4>
                                            {result.worksheet.fill_up.questions.map((item, index) => (
                                                <div key={index} className="mb-4">
                                                    <p className="text-gray-700"><strong>{index + 1}. {item.question} ({item.difficulty})</strong></p>
                                                    {item.options && item.options.length > 0 && (
                                                        <div className="ml-4">
                                                            <p className="font-semibold">Options:</p>
                                                            {item.options.map((option, optionIndex) => (
                                                                <p key={optionIndex}>{option}</p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            <h4 className="text-md font-semibold mb-2 mt-4">Multiple Choice Questions</h4>
                                            {result.worksheet.mcq.questions.map((item, index) => (
                                                <div key={index} className="mb-4">
                                                    <p className="text-gray-700"><strong>{index + 1}. {item.question} ({item.difficulty})</strong></p>
                                                    <div className="ml-4">
                                                        {item.options.map((option, optionIndex) => (
                                                            <p key={optionIndex}>{option}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}

                                            <h4 className="text-md font-semibold mb-2 mt-4">Open Ended Questions</h4>
                                            {result.worksheet.open_ended.questions.map((item, index) => (
                                                <div key={index} className="mb-4">
                                                    <p className="text-gray-700"><strong>{index + 1}. {item.question} ({item.difficulty})</strong></p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold mb-4">Answers</h3>

                                            <h4 className="text-md font-semibold mb-2">Fill in the Blanks</h4>
                                            {result.worksheet.fill_up.questions.map((item, index) => (
                                                <div key={index} className="mb-4">
                                                    <p className="text-gray-700"><strong>{index + 1}. Answer: {item.answer}</strong></p>
                                                </div>
                                            ))}

                                            <h4 className="text-md font-semibold mb-2 mt-4">Multiple Choice Questions</h4>
                                            {result.worksheet.mcq.questions.map((item, index) => (
                                                <div key={index} className="mb-4">
                                                    <p className="text-gray-700"><strong>{index + 1}. Correct Answer: {item.answer}</strong></p>
                                                </div>
                                            ))}

                                            <h4 className="text-md font-semibold mb-2 mt-4">Open Ended Questions</h4>
                                            {result.worksheet.open_ended.questions.map((item, index) => (
                                                <div key={index} className="mb-4">
                                                    <p className="text-gray-700"><strong>{index + 1}. Answer:</strong></p>
                                                    <p className="ml-4 text-gray-600">{item.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <br />

                            <ActionButtons contentRef={contentRef} result={result} docType={'worksheet-generator'} />
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
