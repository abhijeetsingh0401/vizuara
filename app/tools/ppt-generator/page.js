'use client'
import { useState, useRef, useContext } from "react";
import { firestore, doc, setDoc, writeBatch } from '@lib/firebase'; // Import Firestore methods from your library
import { UserContext } from '@lib/context'; // Import UserContext to get the user data
import PptxGenJS from 'pptxgenjs';
import ActionButtons from '@components/ActionButton';
import toast from 'react-hot-toast';
import PdfTextExtractor from "@components/PdfTextExtractor";

export default function PPTGenerator({ params }) {
    const contentRef = useRef(null);
    const { user, username } = useContext(UserContext); // Get user and username from UserContext

    const [isFormVisible, setIsFormVisible] = useState(true);
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pptUrl, setPptUrl] = useState(null); // State to store PPT URL
    const [formData, setFormData] = useState({
        topic: ""
    });
    const [docId, setDocId] = useState(null); // State to store the document ID

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
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ppt-generator`, {
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
            if (!data || !data.Title) {
                toast.success('Received empty or invalid data');
            }

            setResult(data);

            const pptx = new PptxGenJS();
            pptx.addSlide().addText(data.Title, { x: 1, y: 1, fontSize: 24 });

            Object.keys(data).forEach((key, index) => {
                if (key.startsWith('Slides')) {
                    const slideData = data[key];
                    const slideContent = pptx.addSlide();
                    slideContent.addText(slideData.subTitle, { x: 1, y: 1, fontSize: 20 });
                    slideData.array.forEach((contentItem, contentIndex) => {
                        slideContent.addText(`${contentIndex + 1}. ${contentItem}`, { x: 1, y: 2 + (contentIndex * 0.5), fontSize: 16 });
                    });
                }
            });

            pptx.writeFile({ fileName: `${data.Title}.pptx` });

            pptx.write('blob').then((pptBlob) => {
                const pptUrl = URL.createObjectURL(pptBlob);
                //console.log(`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(pptUrl)}`)
                setPptUrl(pptUrl);
            });

            if (user && username) {
                console.log("SAVING TO FIREBASE");

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
                    toast.success('Updated Generated PPT to history!');
                } else {
                    toast.success('Saved Generated PPT to history!');
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
            topic: ""
        })
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
                            <h1 className="text-xl font-bold">PPT Generator</h1>
                            <div className="flex space-x-2">
                                <button
                                    className="flex items-center text-blue-500"
                                    onClick={() => {
                                        setFormData({
                                            topic: ""
                                        });
                                        setDocId(null);
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
                            Generate a detailed presentation outline on your chosen topic.
                        </p>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 flex items-center justify-between">
                                    Topic: <PdfTextExtractor onTextExtracted={handlePdfTextExtracted} targetField="topic" />
                                </label>
                                <textarea
                                    type="text"
                                    name="topic"
                                    data-tour-id="name-topic"
                                    required
                                    placeholder="Enter presentation topic"
                                    className="border border-gray-300 rounded-lg w-full h-10 px-2 bg-white"
                                    value={formData.topic}
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
                                <h1 className="text-xl font-bold">PPT Generator</h1>
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
                                        <div>
                                            {Object.keys(result).map((key, index) => {
                                                if (key.startsWith('Slides')) {
                                                    return (
                                                        <div key={index} className="mb-4">
                                                            <h3 className="text-lg font-semibold">{result[key].subTitle}</h3>
                                                            {result[key].array.map((contentItem, contentIndex) => (
                                                                <p key={contentIndex} className="text-gray-700">{contentItem}</p>
                                                            ))}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </div>
                                    </div>
                                )}

                            </div>

                            <br />

                            {pptUrl && (
                                <div className="mt-6">
                                    {/* <h3 className="text-lg font-semibold mb-2">Generated PPT:</h3>
                                    <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(pptUrl)}`} className="w-full h-64 border border-gray-300 rounded-lg"></iframe> */}
                                    <a href={pptUrl} download={`${result.Title}.pptx`} className="block mt-2 text-blue-500">Download PPT</a>
                                </div>
                            )}

                            <br />

                            <ActionButtons contentRef={contentRef} result={result} docType={'ppt-generator'} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
