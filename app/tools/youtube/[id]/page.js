'use client'
import { useState, useRef, useContext, useEffect } from "react";
import { jsPDF } from "jspdf";
import { firestore, doc, setDoc, getDoc } from '@lib/firebase'; // Import Firestore methods from your library
import { UserContext } from '@lib/context'; // Import UserContext to get the user data
import { useRouter } from 'next/navigation';
import ActionButtons from '@components/ActionButton';

export default function YouTubePage({ params }) {
  const contentRef = useRef(null);
  const { user, username } = useContext(UserContext); // Get user and username from UserContext
  const router = useRouter(); // Get router from next/navigation

  const { id } = params;
  console.log("ID:", id)

  const [isFormVisible, setIsFormVisible] = useState(true);
  const [result, setResult] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    gradeLevel: "5th-grade",
    numberOfQuestions: 3,
    questionTypes: "MCQ",
    videoIdOrURL: "",
    hardQuestions: 1,
    mediumQuestions: 1,
    easyQuestions: 1,
  });

  // useEffect(() => {
  //   // Redirect to /enter page if the user is not logged in
  //   if (!user) {
  //     router.push('/enter');
  //   }
  // }, [user, router]);

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
    { value: 20, label: "20" }
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 space-y-6">
      {isFormVisible && (
        <div className="bg-white shadow rounded-lg overflow-hidden w-full max-w-lg p-6">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">YouTube Video Questions</h1>
              <div className="flex space-x-2">
                <button
                  className="flex items-center text-blue-500"
                  onClick={() => {
                    setFormData({
                      gradeLevel: "5th-grade",
                      numberOfQuestions: 3,
                      questionTypes: "MCQ",
                      videoIdOrURL: "",
                      hardQuestions: 1,
                      mediumQuestions: 1,
                      easyQuestions: 1,
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
                <h1 className="text-xl font-bold">Youtube Question Generator</h1>
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
                      <h3 className="text-lg font-semibold mb-4">Questions</h3>
                      {result.Questions.map((item, index) => (
                        <div key={index} className="mb-4">
                          <p className="text-gray-700"><strong>{index + 1}. {item.question} ({item.difficulty})</strong></p>
                          {item.options.map((option, optionIndex) => (
                            <p key={optionIndex} className="ml-4">{String.fromCharCode(97 + optionIndex)}. {option}</p>
                          ))}
                        </div>
                      ))}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Answers</h3>
                      {result.Questions.map((item, index) => (
                        <div key={index} className="mb-4">
                          <p className="text-gray-700"><strong>{index + 1}. Correct Answer: {item.answer}</strong></p>
                          <p className="text-gray-700"><em>Explanation: {item.explanation}</em></p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <br />

              <ActionButtons contentRef={contentRef} result={result} docType={'youtube-generator'} />
            </div>
          )}
        </div>
      )}

    </div>
  );
}
