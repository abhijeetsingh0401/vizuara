"use client";
import { useState, useRef } from "react";
import { jsPDF } from "jspdf";

export default function TextDependentQuestion() {
  const contentRef = useRef(null);

  const [isFormVisible, setIsFormVisible] = useState(true);
  const [result, setResult] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    gradeLevel: "5th-grade",
    numberOfQuestions: 3,
    questionTypes: "",
    videoIdOrURL: "",
    hardQuestions: 1,
    mediumQuestions: 1,
    easyQuestions: 1,
    questionText: "",
    fileURL: "",
  });

  const gradeLevels = [
    { value: "5th-grade", label: "5th grade" },
    { value: "6th-grade", label: "6th grade" },
    { value: "7th-grade", label: "7th grade" },
    { value: "8th-grade", label: "8th grade" },
    { value: "9th-grade", label: "9th grade" },
    { value: "10th-grade", label: "10th grade" },
    { value: "11th-grade", label: "11th grade" },
    { value: "12th-grade", label: "12th grade" },
  ];

  const numberOfQuestions = [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" },
    { value: 6, label: "6" },
    { value: 7, label: "7" },
    { value: 8, label: "8" },
    { value: 9, label: "9" },
    { value: 10, label: "10" },
    { value: 11, label: "11" },
    { value: 12, label: "12" },
    { value: 13, label: "13" },
    { value: 14, label: "14" },
    { value: 15, label: "15" },
    { value: 16, label: "16" },
    { value: 17, label: "17" },
    { value: 18, label: "18" },
    { value: 19, label: "19" },
    { value: 20, label: "20" },
  ];

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

      console.log("formData:", formData);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setResult(data);
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
                      gradeLevel: "5th-grade",
                      numberOfQuestions: 3,
                      questionTypes: "",
                      videoIdOrURL: "",
                      hardQuestions: 1,
                      mediumQuestions: 1,
                      easyQuestions: 1,
                      questionText: "",
                      fileURL: "",
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
                  Grade level:
                </label>
                <select
                  name="gradeLevel"
                  data-tour-id="name-gradeLevel"
                  required=""
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
                  required=""
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
                  required=""
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
                        onChange={handlePDFUpload}
                        required={false}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    name="questionText"
                    data-tour-id="name-questionText"
                    required=""
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
