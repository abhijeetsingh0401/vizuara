"use client";
import { useState, useRef, useEffect, useContext } from "react";
import { jsPDF } from "jspdf";
import { firestore, doc, setDoc, writeBatch } from '@lib/firebase'; // Import Firestore methods from your library
import { UserContext } from '@lib/context'; // Import UserContext to get the user data
import { useRouter } from 'next/navigation';
import ActionButtons from '@components/ActionButton';
import toast from 'react-hot-toast';
import { gradeLevels, numberOfQuestions, textQuestionTypeOptions } from '@utils/utils';
import PdfTextExtractor from "@components/PdfTextExtractor";

export default function TextDependentQuestion({params}) {
  const contentRef = useRef(null);
  const { user, username } = useContext(UserContext); // Get user and username from UserContext
  const router = useRouter(); // Get router from next/navigation

  const [isFormVisible, setIsFormVisible] = useState(true);
  const [result, setResult] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    gradeLevel: "5th-grade",
    numberOfQuestions: 3,
    questionTypes: "Comprehension",
    hardQuestions: 1,
    mediumQuestions: 1,
    easyQuestions: 1,
    questionText: "",
    pdfText: ""
  });

  const [pdfjsLib, setPdfjsLib] = useState(null);
  const [docId, setDocId] = useState(null); // State to store the document ID

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

  const handlePdfTextExtracted = (extractedText, targetField) => {

    setFormData(prevState => ({
      ...prevState,
      [targetField]: prevState[targetField] + (prevState[targetField] ? '\n\n' : '') + extractedText
    }));

  };

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
    let otherValues = otherSliders.map(
      (slider) => formData[`${slider}Questions`]
    );

    // Calculate the new values for the other sliders
    if (remainingQuestions >= 0) {
      let newOtherValues = otherValues.map((v, i) => {
        if (remainingQuestions <= 0) {
          return 0;
        }
        let newValue = Math.floor(
          remainingQuestions / (otherValues.length - i)
        );
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

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/text-dependent-question`, {
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

      console.log("DATA:", data)

      setResult(data);
      console.log("DATA:", data)

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
          toast.success('Updated question saved to history!');
        } else {
          toast.success('Generated question saved to history!');
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
      questionTypes: "Comprehension",
      numberOfQuestions: 3,
      hardQuestions: 1,
      mediumQuestions: 1,
      easyQuestions: 1,
      questionText: "",
      pdfText: "",
    });
    setIsFormVisible(true);
    setResult(null);
    setDocId(null);
  };

  const handleEditPrompt = () => {
    setIsFormVisible(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 space-y-6">
      {isFormVisible && (
        <div className="bg-white shadow rounded-lg overflow-hidden w-full max-w-3xl p-6">
          {" "}
          {/* Updated max-width */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Text Dependent Questions</h1>
              <div className="flex space-x-2">
                <button
                  className="flex items-center text-blue-500"
                  onClick={() => {
                    setFormData({
                      gradeLevel: "5th-grade",
                      questionTypes: "Comprehension",
                      numberOfQuestions: 3,
                      hardQuestions: 1,
                      mediumQuestions: 1,
                      easyQuestions: 1,
                      questionText: "",
                      pdfText: "",
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
            <p className="text-gray-600">Text Dependent Question.</p>
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
                  Question Type:
                </label>
                <select
                  name="questionTypes"
                  data-tour-id="name-questionTypes"
                  required
                  className="border border-gray-300 rounded-lg w-full h-10 px-2 bg-white"
                  value={formData.questionTypes || "Comprehension"}
                  onChange={handleChange}
                >
                  {textQuestionTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
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
                  onChange={(e) =>
                    handleSliderChange("hard", parseInt(e.target.value, 10))
                  }
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
                  onChange={(e) =>
                    handleSliderChange("medium", parseInt(e.target.value, 10))
                  }
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
                  onChange={(e) =>
                    handleSliderChange("easy", parseInt(e.target.value, 10))
                  }
                />
                <span>{formData.easyQuestions}</span>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 flex items-center justify-between">
                  Insert the text you want to generate text dependent questions
                  for: <PdfTextExtractor onTextExtracted={handlePdfTextExtracted} targetField="questionText" />
                </label>
                <div className="flex items-start space-x-2">

                  <textarea
                    type="text"
                    name="questionText"
                    data-tour-id="name-questionText"
                    required
                    placeholder="Insert the text you want to generate text dependent questions for."
                    className="border border-gray-300 rounded-lg w-full h-16 px-2 py-2 bg-white"
                    value={formData.questionText}
                    onChange={handleChange}
                    style={{ verticalAlign: "top", textAlign: "left" }}
                  />
                </div>
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
                <h1 className="text-xl font-bold">Text Dependent Question</h1>
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
                    <p className="text-lg mb-4"><strong>Text Theme:</strong> {result['Original Theme']}</p>

                    {/* Original Text section - you'll need to add this to your data structure */}
                    {result.OriginalText && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Original Text:</h3>
                        <p className="text-gray-700">{result.OriginalText}</p>
                      </div>
                    )}

                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4">Questions</h3>
                      {result['text-question'].map((item, index) => (
                        <div key={index} className="mb-4">
                          <p className="text-gray-700">
                            <strong>{index + 1}. {item.question}</strong>
                            <span className="text-sm text-gray-500 ml-2">({item.difficulty})</span>
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8">
                      <h3 className="text-xl font-bold mb-6 text-gray-800">Answers and Explanations</h3>
                      {result['text-question'].map((item, index) => (
                        <div key={index} className="mb-8 p-6 bg-white">
                          <div className="mb-4">
                            <strong className="text-lg text-blue-600">Answer {index + 1}:</strong>
                            <p className="mt-2 text-gray-700 leading-relaxed">{item.answer}</p>
                          </div>
                          <div>
                            <strong className="text-lg text-green-600">Explanation:</strong>
                            <p className="mt-2 text-gray-600 leading-relaxed italic">{item.explanation}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                )}
              </div>

              <br />

              <ActionButtons contentRef={contentRef} result={result} docType={'text-dependent-question'} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
