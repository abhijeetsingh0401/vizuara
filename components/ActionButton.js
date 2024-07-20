import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';

const ActionButtons = ({ contentRef, result }) => {
    const [isReading, setIsReading] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [speechInstance, setSpeechInstance] = useState(null);

    useEffect(() => {
        const handleUnload = () => {
            window.speechSynthesis.cancel();
        };

        window.addEventListener('beforeunload', handleUnload);

        return () => {
            window.speechSynthesis.cancel();
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, []);

    const handleCopy = () => {
        if (contentRef.current) {
            const content = contentRef.current.innerText;
            navigator.clipboard.writeText(content).then(() => {
                alert('Content copied to clipboard');
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        }
    };

    const handleExport = (result) => {
        const doc = new jsPDF();

        // Initial Y position
        let yPos = 10;

        // Add strengths
        doc.text("Areas of Strength:", 10, yPos);
        yPos += 10;

        result.Strength.forEach((strength, index) => {
            const strengthText = `${index + 1}. ${strength}`;
            const strengthLines = doc.splitTextToSize(strengthText, 180);
            doc.text(strengthLines, 10, yPos);
            yPos += strengthLines.length * 10; // Space after each strength

            // Add extra space if needed
            yPos += 5;

            // If yPos exceeds page height, add a new page
            if (yPos > 280) {
                doc.addPage();
                yPos = 10;
            }
        });

        // Add extra space before weaknesses
        yPos += 10;

        // Add weaknesses
        doc.text("Areas of Improvements:", 10, yPos);
        yPos += 10;

        result.Weakness.forEach((weakness, index) => {
            const weaknessText = `${index + 1}. ${weakness}`;
            const weaknessLines = doc.splitTextToSize(weaknessText, 180);
            doc.text(weaknessLines, 10, yPos);
            yPos += weaknessLines.length * 10; // Space after each weakness

            // Add extra space if needed
            yPos += 5;

            // If yPos exceeds page height, add a new page
            if (yPos > 280) {
                doc.addPage();
                yPos = 10;
            }
        });

        // Save the PDF
        doc.save("strengths_and_weaknesses.pdf");
    };

    const handleReadAloud = () => {
        if (contentRef.current) {
            const content = contentRef.current.innerText;
            const speech = new SpeechSynthesisUtterance(content);
            speech.lang = 'en-US'; // Set the language

            speech.onend = () => {
                setIsReading(false);
                setIsPaused(false);
                setSpeechInstance(null);
            };

            window.speechSynthesis.speak(speech);
            setSpeechInstance(speech);
            setIsReading(true);
            setIsPaused(false);
        }
    };

    const handlePause = () => {
        if (speechInstance) {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    };

    const handleResume = () => {
        if (speechInstance) {
            window.speechSynthesis.resume();
            setIsPaused(false);
        }
    };

    const handleRestart = () => {
        window.speechSynthesis.cancel(); // Stop the current speech
        handleReadAloud(); // Restart from the beginning
    };

    return (
        <div className="animate-blurIn flex items-center justify-center h-full" data-tour-id="message-actions">
            <div className="flex space-x-2">
                <button className="flex items-center border p-2 rounded-lg text-gray-700" onClick={handleCopy}>
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
                {!isReading ? (
                    <button className="flex items-center border p-2 rounded-lg text-gray-700" onClick={handleReadAloud}>
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
                ) : (
                    <>
                        {isPaused ? (
                            <button className="flex items-center border p-2 rounded-lg text-gray-700" onClick={handleResume}>
                                <svg
                                    className="h-5 w-5 mr-1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M8 5v14l11-7z"></path>
                                </svg>
                                Resume
                            </button>
                        ) : (
                            <button className="flex items-center border p-2 rounded-lg text-gray-700" onClick={handlePause}>
                                <svg
                                    className="h-5 w-5 mr-1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
                                </svg>
                                Pause
                            </button>
                        )}
                        <button className="flex items-center border p-2 rounded-lg text-gray-700" onClick={handleRestart}>
                            <svg
                                className="h-5 w-5 mr-1"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M12 5V2L8 6l4 4V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-2.99-7.86-7-8z"></path>
                            </svg>
                            Restart
                        </button>
                    </>
                )}
                <button className="flex items-center border p-2 rounded-lg text-gray-700" onClick={() => handleExport(result)}>
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
            </div>
        </div>
    );
};

export default ActionButtons;
