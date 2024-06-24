// components/PdfUpload.js
import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Tesseract and pdfjs-dist
const PdfjsLib = dynamic(() => import('pdfjs-dist/webpack'), { ssr: false });
const Tesseract = dynamic(() => import('tesseract.js'), { ssr: false });

const PdfUpload = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        const typedarray = new Uint8Array(reader.result);
        const pdfjsLib = await PdfjsLib;
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        let extractedText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(' ');
          extractedText += pageText + '\n';
        }
        setText(extractedText);
        setLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Please upload a PDF file.');
    }
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {loading && <p>Loading...</p>}
      {!loading && text && (
        <div>
          <h2>Extracted Text:</h2>
          <p>{text}</p>
        </div>
      )}
    </div>
  );
};

export default PdfUpload;
