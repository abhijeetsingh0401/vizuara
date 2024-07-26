import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

const ActionButtons = ({ contentRef, result, docType }) => {
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
                toast.success('Content copied to clipboard')
            }).catch(err => {
                toast.error('Failed to copy', err);
            });
        }
    };

    const handleExport = (result, docType) => {
        const doc = new jsPDF();

        // Initial Y position
        let yPos = 20; // Start with some padding at the top
        const padding = 20;
        const maxYPos = doc.internal.pageSize.height - padding;

        if (result.Title && result.worksheet && result.About) {

            // Add title
            doc.setFontSize(16);
            doc.text(result.Title, padding, yPos);
            yPos += 15;

            // Add About section
            doc.setFontSize(14);
            doc.text("About", padding, yPos);
            yPos += 10;
            doc.setFontSize(12);
            result.About.forEach((item) => {
                const lines = doc.splitTextToSize(item, doc.internal.pageSize.width - 2 * padding);
                lines.forEach((line) => {
                    if (yPos > maxYPos - 10) {
                        doc.addPage();
                        yPos = padding;
                    }
                    doc.text(line, padding, yPos);
                    yPos += 10;
                });
                yPos += 5;
            });

            // Questions section
            yPos += 10;
            doc.setFontSize(14);
            doc.text("Questions", padding, yPos);
            yPos += 15;

            // Helper function to add questions
            const addQuestions = (questions, subTitle) => {
                doc.setFontSize(12);
                doc.text(subTitle, padding, yPos);
                yPos += 10;
                questions.forEach((item, index) => {
                    const questionText = `${index + 1}. ${item.question} (${item.difficulty})`;
                    const lines = doc.splitTextToSize(questionText, doc.internal.pageSize.width - 2 * padding);
                    lines.forEach((line) => {
                        if (yPos > maxYPos - 10) {
                            doc.addPage();
                            yPos = padding;
                        }
                        doc.text(line, padding, yPos);
                        yPos += 10;
                    });

                    if (item.options && item.options.length > 0) {
                        item.options.forEach((option, optionIndex) => {
                            if (yPos > maxYPos - 10) {
                                doc.addPage();
                                yPos = padding;
                            }
                            doc.text(option, padding + 10, yPos);
                            yPos += 10;
                        });
                    }
                    yPos += 5;
                });
                yPos += 10;
            };

            // Add questions for each type
            addQuestions(result.worksheet.fill_up.questions, "Fill in the Blanks");
            addQuestions(result.worksheet.mcq.questions, "Multiple Choice Questions");
            addQuestions(result.worksheet.open_ended.questions, "Open Ended Questions");

            // Answers section
            doc.addPage();
            yPos = padding;
            doc.setFontSize(14);
            doc.text("Answers", padding, yPos);
            yPos += 15;

            // Helper function to add answers
            const addAnswers = (questions, subTitle) => {
                doc.setFontSize(12);
                doc.text(subTitle, padding, yPos);
                yPos += 10;
                questions.forEach((item, index) => {
                    const answerText = `${index + 1}. Answer: ${item.answer}`;
                    const lines = doc.splitTextToSize(answerText, doc.internal.pageSize.width - 2 * padding);
                    lines.forEach((line) => {
                        if (yPos > maxYPos - 10) {
                            doc.addPage();
                            yPos = padding;
                        }
                        doc.text(line, padding, yPos);
                        yPos += 10;
                    });
                    yPos += 5;
                });
                yPos += 10;
            };

            // Add answers for each type
            addAnswers(result.worksheet.fill_up.questions, "Fill in the Blanks");
            addAnswers(result.worksheet.mcq.questions, "Multiple Choice Questions");
            addAnswers(result.worksheet.open_ended.questions, "Open Ended Questions");

            // Save the PDF
            doc.save(`${result.Title}_worksheet.pdf`);
            return;
        }

        if (result['text-question']) {
            // Add title
            doc.setFontSize(14);
            doc.text("Original Text:", padding, yPos);
            yPos += 10;
            doc.setFontSize(12);
            
            const maxWidth = doc.internal.pageSize.width - 2 * padding;
            const textLines = doc.splitTextToSize(result['Original Text'], maxWidth);
            
            textLines.forEach((line) => {
                if (yPos > maxYPos - 10) {
                    doc.addPage();
                    yPos = padding;
                }
                doc.text(line, padding, yPos);
                yPos += 10;
            });
            
            yPos += 15;
    
            // Add Original Text if present
            if (result.OriginalText) {
                doc.setFontSize(14);
                doc.text("Original Text:", padding, yPos);
                yPos += 10;
                doc.setFontSize(12);
                const textLines = doc.splitTextToSize(result.OriginalText, doc.internal.pageSize.width - 2 * padding);
                textLines.forEach((line) => {
                    if (yPos > maxYPos - 10) {
                        doc.addPage();
                        yPos = padding;
                    }
                    doc.text(line, padding, yPos);
                    yPos += 10;
                });
                yPos += 15;
            }
    
            // Questions section
            doc.setFontSize(14);
            doc.text("Questions", padding, yPos);
            yPos += 15;
    
            result['text-question'].forEach((item, index) => {
                const questionText = `${index + 1}. ${item.question} (${item.difficulty})`;
                const lines = doc.splitTextToSize(questionText, doc.internal.pageSize.width - 2 * padding);
                lines.forEach((line) => {
                    if (yPos > maxYPos - 10) {
                        doc.addPage();
                        yPos = padding;
                    }
                    doc.text(line, padding, yPos);
                    yPos += 10;
                });
                yPos += 5;
            });
    
            // Answers and Explanations section
            doc.addPage();
            yPos = padding;
            doc.setFontSize(14);
            doc.text("Answers and Explanations", padding, yPos);
            yPos += 15;
    
            result['text-question'].forEach((item, index) => {
                doc.setFontSize(12);
                //doc.setTextColor(0, 0, 255); // Blue color for "Answer"
                doc.text(`Answer ${index + 1}:`, padding, yPos);
                yPos += 10;
                
                doc.setTextColor(0, 0, 0); // Reset to black
                const answerLines = doc.splitTextToSize(item.answer, doc.internal.pageSize.width - 2 * padding);
                answerLines.forEach((line) => {
                    if (yPos > maxYPos - 10) {
                        doc.addPage();
                        yPos = padding;
                    }
                    doc.text(line, padding, yPos);
                    yPos += 10;
                });
                yPos += 5;
    
                //doc.setTextColor(0, 128, 0); // Green color for "Explanation"
                doc.text("Explanation:", padding, yPos);
                yPos += 10;
    
                doc.setTextColor(0, 0, 0); // Reset to black
                const explanationLines = doc.splitTextToSize(item.explanation, doc.internal.pageSize.width - 2 * padding);
                explanationLines.forEach((line) => {
                    if (yPos > maxYPos - 10) {
                        doc.addPage();
                        yPos = padding;
                    }
                    doc.text(line, padding, yPos);
                    yPos += 10;
                });
                yPos += 15;
    
                // if (yPos > maxYPos - 30) {
                //     doc.addPage();
                //     yPos = padding;
                // }
            });
    
            // Save the PDF
            doc.save(`${result.Title}_text_questions.pdf`);
            return;
        }

        // Add title
        if (result.Title) {
            doc.text(result.Title, 20, yPos);
            yPos += 20; // Add extra space after the title
        }

        // Check if Questions key exists

        // Check if Questions key exists
        if (result.Questions) {
            // Print "Questions" header
            doc.text("Questions", padding, yPos);
            yPos += 10;

            // Iterate over the questions
            result.Questions.forEach((item, index) => {
                // Print difficulty and question
                const questionLines = doc.splitTextToSize(`${index + 1}. ${item.question} (${item.difficulty})`, doc.internal.pageSize.width - 2 * padding);

                questionLines.forEach((line) => {
                    // If yPos exceeds page height minus 30, add a new page
                    if (yPos > maxYPos - 30) {
                        doc.addPage();
                        yPos = padding; // Reset yPos with top padding
                    }
                    doc.text(line, padding, yPos);
                    yPos += 10;
                });

                // Print options
                item.options.forEach((option, optionIndex) => {
                    // If yPos exceeds page height minus 30, add a new page
                    if (yPos > maxYPos - 30) {
                        doc.addPage();
                        yPos = padding; // Reset yPos with top padding
                    }
                    doc.text(`${String.fromCharCode(97 + optionIndex)}. ${option}`, padding + 10, yPos);
                    yPos += 10;
                });

                // Add extra space before the next question
                yPos += 10;

                // If yPos exceeds page height minus 30, add a new page
                if (yPos > maxYPos - 30) {
                    doc.addPage();
                    yPos = padding; // Reset yPos with top padding
                }
            });

            // Add extra space before "Answers" section
            yPos += 20;

            // Print "Answers" header
            doc.text("Answers", padding, yPos);
            yPos += 10;

            // Iterate over the questions again for answers
            result.Questions.forEach((item, index) => {
                // Print answer
                if (yPos > maxYPos - 30) {
                    doc.addPage();
                    yPos = padding; // Reset yPos with top padding
                }
                doc.text(`${index + 1}. Correct Answer: ${item.answer}`, padding, yPos);
                yPos += 10;

                const explanationLines = doc.splitTextToSize(`Explanation: ${item.explanation}`, doc.internal.pageSize.width - 2 * padding);
                explanationLines.forEach((line) => {
                    // If yPos exceeds page height minus 30, add a new page
                    if (yPos > maxYPos - 30) {
                        doc.addPage();
                        yPos = padding; // Reset yPos with top padding
                    }
                    doc.text(line, padding, yPos);
                    yPos += 10;
                });

                // Add extra space before the next answer
                yPos += 10;

                // If yPos exceeds page height minus 30, add a new page
                if (yPos > maxYPos - 30) {
                    doc.addPage();
                    yPos = padding; // Reset yPos with top padding
                }
            });

            // Save the PDF and return early to avoid processing further keys
            doc.save(`${result.Title}_${docType}_report.pdf`);
            return;
        }

        // Iterate over each key in the result object
        Object.keys(result).forEach((key) => {
            if (key !== 'Title') {
                // Check if the value is a string and handle accordingly
                if (typeof result[key] === 'string') {
                    // Add the section header and value for string type
                    doc.text(`${key.replace(/([A-Z])/g, ' $1')}:`, 20, yPos);
                    yPos += 10;
                    const itemLines = doc.splitTextToSize(result[key], 170); // 180 -> 170 for padding
                    doc.text(itemLines, 20, yPos);
                    yPos += itemLines.length * 10 + 5; // Space after the string value
                }

                // Handle the case where the key is "totalMarks" or "marks"
                if (key === "totalMarks" || key === "marks") {
                    // Add the section header and the array beside it
                    doc.text(`${result[key].subTitle}: ${result[key].array}`, 20, yPos);
                    yPos += 15;
                }
                // Check if the value is an object with subTitle and array
                else if (result[key].subTitle && Array.isArray(result[key].array) && result[key].array.length > 0) {
                    // Add the section header
                    doc.text(result[key].subTitle, 20, yPos);
                    yPos += 10;

                    // Add each item in the array
                    result[key].array.forEach((item) => {
                        const itemText = `${item}`;
                        const itemLines = doc.splitTextToSize(itemText, 170); // 180 -> 170 for padding
                        doc.text(itemLines, 20, yPos);
                        yPos += itemLines.length * 10; // Space after each item

                        // Add extra space if needed
                        yPos += 5;

                        // If yPos exceeds page height, add a new page
                        if (yPos > 270) { // Adjusted for bottom padding
                            doc.addPage();
                            yPos = 20; // Reset yPos with top padding
                        }
                    });

                    // Add extra space before the next section
                    yPos += 10;
                }
                // Check if the value is an array and handle accordingly
                else if (Array.isArray(result[key]) && result[key].length > 0) {
                    // Add the section header
                    doc.text(`${key.replace(/([A-Z])/g, ' $1')}:`, 20, yPos);
                    yPos += 10;

                    // Add each item in the array
                    result[key].forEach((item) => {
                        const itemText = `${item}`;
                        const itemLines = doc.splitTextToSize(itemText, 170); // 180 -> 170 for padding
                        doc.text(itemLines, 20, yPos);
                        yPos += itemLines.length * 10; // Space after each item

                        // Add extra space if needed
                        yPos += 5;

                        // If yPos exceeds page height, add a new page
                        if (yPos > 270) { // Adjusted for bottom padding
                            doc.addPage();
                            yPos = 20; // Reset yPos with top padding
                        }
                    });

                    // Add extra space before the next section
                    yPos += 10;
                }
            }
        });

        // Save the PDF with a dynamic filename
        doc.save(`${result.Title}_${docType}_report.pdf`);
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
            toast.success('Read Aloud Paused')

        }
    };

    const handleResume = () => {
        if (speechInstance) {
            window.speechSynthesis.resume();
            setIsPaused(false);
            toast.success('Read Aloud Resumed')
        }
    };

    const handleRestart = () => {
        window.speechSynthesis.cancel(); // Stop the current speech
        handleReadAloud(); // Restart from the beginning
        toast.success('Read Aloud Restarted')
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
                <button className="flex items-center border p-2 rounded-lg text-gray-700" onClick={() => handleExport(result, docType)}>
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
