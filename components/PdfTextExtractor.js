// components/PdfUpload.js
import React, { useState, useEffect } from 'react';

const PdfTextExtractor = ({ onTextExtracted, targetField }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfjsLib, setPdfjsLib] = useState(null);

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
        onTextExtracted(extractedText, targetField);
        setLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Please upload a PDF file.');
    }
  };

  return (
    <div className="inline-flex items-center space-x-2">
      <label className="relative cursor-pointer bg-blue-500 text-white text-sm px-3 py-1 rounded-md hover:bg-blue-600 transition-colors">
        <span className="flex items-center">
          {loading ? (
            <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
          )}
          {loading ? 'Loading...' : 'PDF'}
        </span>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </label>
    </div>
  );
};

export default PdfTextExtractor;
