// components/PdfUpload.js
import React, { useState, useEffect } from 'react';

const PdfUpload = () => {
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
