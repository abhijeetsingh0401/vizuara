"use client";
import { useState, useRef, useEffect, useContext } from "react";
import { jsPDF } from "jspdf";
import { firestore, doc, setDoc } from '@lib/firebase'; // Import Firestore methods from your library
import { UserContext } from '@lib/context'; // Import UserContext to get the user data
import { useRouter } from 'next/navigation';
import ActionButtons from '@components/ActionButton';
import toast from 'react-hot-toast';
import { gradeLevels, numberOfQuestions } from '@utils/utils';

export default function TextDependentQuestion() {
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
    questionTypes: "",
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
      const response = await fetch("/api/text-dependent-question", {
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
      if (!data || !data.Title || !data.Objective) {
        toast.success('Received empty or invalid data');
      }

      setResult(data);
      toast.success('Report card generated successfully!');

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

        // Update the document ID state only after successful operation
        setDocId(newDocId);

        toast.success('Saved report card with updated title to history!');
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
      questionTypes: "",
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
                      questionTypes: "",
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
                  Question Type:
                </label>
                <input
                  type="text"
                  name="questionTypes"
                  data-tour-id="name-questionTypes"
                  required
                  placeholder="Comprehension, Literary Devices, Mix of Literary Devices & Comprehension, Theme, etc."
                  className="border border-gray-300 rounded-lg w-full h-16 px-2 py-2 bg-white" // Adjusted padding here
                  value={formData.questionTypes}
                  onChange={handleChange}
                />
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
                <label className="block text-sm font-medium text-gray-700">
                  Insert the text you want to generate text dependent questions
                  for:
                </label>
                <div className="flex items-start space-x-2">
                  <div className="flex flex-col items-center space-y-2">
                    {/* Voice Input Icon */}
                    <button
                      type="button"
                      className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full"
                    >
                      <svg
                        className="h-6 w-6 text-gray-700"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 1c-1.66 0-3 1.34-3 3v7c0 1.66 1.34 3 3 3s3-1.34 3-3V4c0-1.66-1.34-3-3-3zm6.3 7c0-3.2-2.58-5.8-5.8-5.8S6.7 4.8 6.7 8v4c0 2.4 1.94 4.4 4.3 4.9v1.2H9.8v1.6h4.4v-1.6h-1.2v-1.2c2.36-.5 4.3-2.5 4.3-4.9V8zm-5.8 9.2c-.8 0-1.5-.2-2.1-.6l-.8.8c.6.5 1.3.8 2.1.8 1.7 0 3.1-1.4 3.1-3.1h-1.6c0 .8-.7 1.5-1.5 1.5-.5 0-.9-.2-1.2-.5l-.8.8c.5.5 1.2.8 2 .8 1.7 0 3-1.3 3-3h1.6c.1 1.7-1.3 3.2-3.1 3.2z"></path>
                      </svg>
                    </button>
                    {/* PDF Upload Icon */}
                    <label
                      htmlFor="pdf-upload"
                      className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full cursor-pointer"
                    >
                      <svg
                        className="h-6 w-6 text-gray-700"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-6V3.5L18.5 8H13z"></path>
                      </svg>
                      <input
                        id="pdf-upload"
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleFileChange}
                        required={false}
                      />
                    </label>
                  </div>
                  <input
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
                <h1 className="text-xl font-bold">Report Card Generator</h1>
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

              <ActionButtons contentRef={contentRef} result={result} docType={'report-card'} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
