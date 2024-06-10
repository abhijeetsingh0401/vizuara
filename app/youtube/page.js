'use client'
import { useState } from "react";
import { jsPDF } from "jspdf";

export default function YouTubePage() {
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [result, setResult] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    gradeLevel: "pre-k",
    numberOfQuestions: 3,
    questionTypes: "MCQ",
    videoIdOrURL: "",
    hardQuestions: 1,
    mediumQuestions: 1,
    easyQuestions: 1,
  });

  const gradeLevels = [
    { value: "pre-k", label: "Pre-K" },
    { value: "kindergarten", label: "Kindergarten" },
    { value: "1st-grade", label: "1st grade" },
    { value: "2nd-grade", label: "2nd grade" },
    { value: "3rd-grade", label: "3rd grade" },
    { value: "4th-grade", label: "4th grade" },
    { value: "5th-grade", label: "5th grade" },
    { value: "6th-grade", label: "6th grade" },
    { value: "7th-grade", label: "7th grade" },
    { value: "8th-grade", label: "8th grade" },
    { value: "9th-grade", label: "9th grade" },
    { value: "10th-grade", label: "10th grade" },
    { value: "11th-grade", label: "11th grade" },
    { value: "12th-grade", label: "12th grade" },
    { value: "university", label: "University" },
    { value: "year-1", label: "Year 1" },
    { value: "year-2", label: "Year 2" },
    { value: "year-3", label: "Year 3" },
    { value: "year-4", label: "Year 4" },
    { value: "year-5", label: "Year 5" },
    { value: "year-6", label: "Year 6" },
    { value: "year-7", label: "Year 7" },
    { value: "year-8", label: "Year 8" },
    { value: "year-9", label: "Year 9" },
    { value: "year-10", label: "Year 10" },
    { value: "year-11", label: "Year 11" },
    { value: "year-12", label: "Year 12" },
    { value: "year-13", label: "Year 13" },
  ];

  const numberOfQuestions = [
    { value: 3, label: "3" },
    { value: 5, label: "5" },
    { value: 7, label: "7" },
    { value: 10, label: "10" },
  ];

  const questionTypes = [
    { value: "MCQ", label: "Multiple choice" },
    { value: "TrueFalse", label: "True or False" },
    { value: "FreeResponse", label: "Free response" },
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

    try {
      const response = await fetch("/api/youtubequestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("formData:", formData)

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
      const answerText = `${index + 1}. ${item.answer}`;
      const answerLines = doc.splitTextToSize(answerText, 180);
      doc.text(answerLines, 10, yPos);
      yPos += answerLines.length * 10; // Space after the answer

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


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {isFormVisible ? (
        <div className="bg-white shadow rounded-lg overflow-hidden w-full max-w-lg p-6">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">YouTube Video Questions</h1>
              <div className="flex space-x-2">
                <button
                  className="flex items-center text-blue-500"
                  onClick={() =>
                    setFormData({
                      gradeLevel: "pre-k",
                      numberOfQuestions: 3,
                      questionTypes: "MCQ",
                      videoIdOrURL: "",
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
                <button className="flex items-center text-blue-500">
                  <svg
                    className="h-5 w-5 mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
                  </svg>
                  Exemplar
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
                <select
                  name="questionTypes"
                  data-tour-id="name-questionTypes"
                  required=""
                  className="border border-gray-300 rounded-lg w-full h-10 px-2 bg-white"
                  value={formData.questionTypes}
                  onChange={handleChange}
                >
                  {questionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
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
                <label className="block text-sm font-medium text-gray-700">
                  Video ID or URL:
                </label>
                <input
                  name="videoIdOrURL"
                  data-tour-id="name-videoIdOrURL"
                  required=""
                  placeholder="https://www.youtube.com/watch?v=8pIlOX_V25Q or 8pIlOX_V25Q"
                  className="border border-gray-300 rounded-lg w-full h-10 px-2 bg-white"
                  value={formData.videoIdOrURL}
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
            <div className="markdown-content" id="md-content-63484949">
              {/* First loop to print questions and options */}
              {result?.map((item, index) => (
                <div key={index}>
                  <h3>{index + 1}. {item.question} ({item.difficulty})</h3>
                  <p>
                    {item.options.map((option, i) => (
                      <span key={i}>
                        {String.fromCharCode(97 + i)}. {option} <br />
                      </span>
                    ))}
                  </p>
                </div>
              ))}

              {/* Print Answers heading */}
              <h2>Answers</h2>

              {/* Second loop to print answers and explanations */}
              {result?.map((item, index) => (
                <div key={index}>
                  <p><strong>{index + 1}.</strong> {item.answer}</p>
                  <p><em>{item.explanation}</em></p>
                </div>
              ))}
            </div>

          )}
          <div className="animate-blurIn" data-tour-id="message-actions">
            <div className="flex space-x-2">
              <button className="flex items-center border p-2 rounded-lg text-gray-700">
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
              <button className="flex items-center border p-2 rounded-lg text-gray-700">
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
              <button className="flex items-center border p-2 rounded-lg text-gray-700">
                <svg
                  className="h-5 w-5 mr-1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2"></path>
                </svg>
                More
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
