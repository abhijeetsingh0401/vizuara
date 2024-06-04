'use client'
import { useState } from "react";

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
                  onChange={handleChange}
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
              <svg
                className="animate-spin h-5 w-5 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 22c5.52 0 10-4.48 10-10s-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10zm1-18h-2v6h6v-2h-4V4zm-1 14h2v-6H8v2h4v4z"></path>
              </svg>
              <span className="ml-2 text-blue-500">Loading...</span>
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="markdown-content" id="md-content-63484949">
              {result?.map((item, index) => (
                <div key={index}>
                  <h3>{index + 1}. {item.question}</h3>
                  <p>
                    {item.options.map((option, i) => (
                      <span key={i}>
                        {String.fromCharCode(97 + i)}. {option} <br />
                      </span>
                    ))}
                  </p>
                  <p><strong>Answer:</strong> {item.answer}</p>
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
              <button className="flex items-center border p-2 rounded-lg text-gray-700">
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
