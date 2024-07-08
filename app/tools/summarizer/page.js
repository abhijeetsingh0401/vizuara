"use client";
import { useState, useRef, useEffect, useContext } from "react";
import { jsPDF } from "jspdf";
import { firestore, doc, setDoc } from '@lib/firebase'; // Import Firestore methods from your library
import { UserContext } from '@lib/context'; // Import UserContext to get the user data
import { useRouter } from 'next/navigation';

export default function TextDependentQuestion() {
    const contentRef = useRef(null);
    const { user, username } = useContext(UserContext); // Get user and username from UserContext
    const router = useRouter(); // Get router from next/navigation

    const [isFormVisible, setIsFormVisible] = useState(true);
    const [result, setResult] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        lengthSummary: "",
        inputText: "",
        pdfText: ""
    });

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
                console.error("PDF.js library is not loaded yet.");
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
                setFormData({ ...formData, ['pdfText']: extractedText });
                console.log("EXTRACTED DATA:", extractedText)
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
            const response = await fetch("/api/summarizer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            console.log("formData:", formData);

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            setResult(data);

            // Save the result to Firestore along with formData using username from context
            if (user && username) {
                console.log("SAVING TO FIREBASE")
                const resultDocRef = doc(firestore, `history/${username}/results/${new Date().toISOString()}`);
                await setDoc(resultDocRef, { formData, result: data });
            }

            setIsFormVisible(false);
        } catch (error) {
            console.error("Error submitting form:", error);
            setError("Failed to load questions. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = (result) => {
        const doc = new jsPDF();

        // Initial Y position
        let yPos = 10;

        // Add questions and options
        result.forEach((item, index) => {
            const questionText = `${index + 1}. ${item.question}`;
            const questionLines = doc.splitTextToSize(questionText, 180);
            doc.text(questionLines, 10, yPos);
            yPos += questionLines.length * 10; // Space after the question

            item.options.forEach((option, i) => {
                const optionText = `${String.fromCharCode(97 + i)}. ${option}`;
                const optionLines = doc.splitTextToSize(optionText, 180);
                doc.text(optionLines, 20, yPos);
                yPos += optionLines.length * 10; // Space between options
            });

            // Add extra space after each set of options
            yPos += 10;
        });

        // Add a new page for answers
        doc.addPage();
        doc.text("Answers", 10, 10);
        yPos = 20;

        result.forEach((item, index) => {
            const correctOptionIndex = item.options.indexOf(item.answer);
            const correctOptionText = `${index + 1}. ${String.fromCharCode(
                97 + correctOptionIndex
            )}. ${item.answer}`;

            const correctOptionLines = doc.splitTextToSize(correctOptionText, 180);
            doc.text(correctOptionLines, 10, yPos);
            yPos += correctOptionLines.length * 10; // Space after the correct option

            const explanationText = `Explanation: ${item.explanation}`;
            const explanationLines = doc.splitTextToSize(explanationText, 180);
            doc.text(explanationLines, 10, yPos);
            yPos += explanationLines.length * 10; // Space after the explanation

            // Add extra space after each answer and explanation set
            yPos += 10;

            // If yPos exceeds page height, add a new page
            if (yPos > 280) {
                doc.addPage();
                yPos = 20;
            }
        });

        doc.save("questions_and_answers.pdf");
    };

    const handleCopy = () => {
        if (contentRef.current) {
            const content = contentRef.current.innerText;
            navigator.clipboard
                .writeText(content)
                .then(() => {
                    alert("Content copied to clipboard");
                })
                .catch((err) => {
                    console.error("Failed to copy: ", err);
                });
        }
    };

    const handleReadAloud = () => {
        if (contentRef.current) {
            const content = contentRef.current.innerText;
            const speech = new SpeechSynthesisUtterance(content);
            speech.lang = "en-US"; // Set the language
            window.speechSynthesis.speak(speech);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            {isFormVisible ? (
                <div className="bg-white shadow rounded-lg overflow-hidden w-full max-w-3xl p-6">
                    {" "}
                    {/* Updated max-width */}
                    <div className="flex flex-col space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-bold">Text Dependent Questions</h1>
                            <div className="flex space-x-2">
                                <button
                                    className="flex items-center text-blue-500"
                                    onClick={() =>
                                        setFormData({
                                            lengthSummary: "",
                                            inputText: "",
                                            pdfText: ""
                                        })
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
                        <p className="text-gray-600">Text Dependent Question.</p>
                        <form className="space-y-4" onSubmit={handleSubmit}>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Length of summary:
                                </label>
                                <input
                                    type="text"
                                    name="lengthSummary"
                                    data-tour-id="name-lengthSummary"
                                    required=""
                                    placeholder="1 para, 1 summary, 500 words"
                                    className="border border-gray-300 rounded-lg w-full h-16 px-2 py-2 bg-white" // Adjusted padding here
                                    value={formData.lengthSummary}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Original Text:
                                </label>
                                <input
                                    type="text"
                                    name="inputText"
                                    data-tour-id="name-inputText"
                                    required=""
                                    placeholder="Paste the original Text here"
                                    className="border border-gray-300 rounded-lg w-full h-16 px-2 py-2 bg-white" // Adjusted padding here
                                    value={formData.inputText}
                                    onChange={handleChange}
                                />
                            </div>


                           {/*
                           Enter the PDF UPLOAD HERE
                           */}

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
                            <img
                                src="/bouncing-circles.svg"
                                alt="Loading"
                                className="w-16 h-16"
                            />
                        </div>
                    ) : error ? (
                        <div className="text-red-500">{error}</div>
                    ) : (
                        <div
                            ref={contentRef}
                            className="markdown-content"
                            id="md-content-63484949"
                        >
                            {/* First loop to print questions and options */}
                            {result?.map((item, index) => (
                                <div key={index} className="question-block">
                                    <div className="question">
                                        <h3>
                                            {index + 1}. {item.question} ({item.difficulty})
                                        </h3>
                                    </div>
                                    <p>
                                        {item.options.map((option, i) => (
                                            <span key={i} className="option">
                                                {String.fromCharCode(97 + i)}. {option} <br />
                                            </span>
                                        ))}
                                    </p>
                                </div>
                            ))}

                            {/* Print Answers heading */}
                            <h2 className="answers-heading">Answers</h2>

                            {/* Second loop to print answers and explanations */}
                            {result?.map((item, index) => (
                                <div key={index} className="answer-block">
                                    <p>
                                        <strong>{index + 1}.</strong> {item.answer}
                                    </p>
                                    <p>
                                        <em>{item.explanation}</em>
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="animate-blurIn" data-tour-id="message-actions">
                        <div className="flex space-x-2">
                            <button
                                className="flex items-center border p-2 rounded-lg text-gray-700"
                                onClick={handleCopy}
                            >
                                <svg
                                    className="h-5 w-5 mr-1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"></path>
                                </svg>
                                Copy
                            </button>
                            <button
                                className="flex items-center border p-2 rounded-lg text-gray-700"
                                onClick={() => handleExport(result)}
                            >
                                <svg
                                    className="h-5 w-5 mr-1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2m-1 8V6h2v4h3l-4 4-4-4zm6 7H7v-2h10z"></path>
                                </svg>
                                Export
                            </button>
                            <button
                                className="flex items-center border p-2 rounded-lg text-gray-700"
                                onClick={handleReadAloud}
                            >
                                <svg
                                    className="h-5 w-5 mr-1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M3 9v6h4l5 5V4L7 9zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77"></path>
                                </svg>
                                Read Aloud
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
