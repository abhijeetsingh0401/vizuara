// components/PDFTextExtractor.js
import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import Tesseract from 'tesseract.js';

// Set the workerSrc property of the pdfjsLib to use the worker script
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

const PDFTextExtractor = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePDFUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
      setLoading(true);
      const text = await extractTextFromPDF(file);
      setText(text);
      setLoading(false);
    }
  };

  const extractTextFromPDF = async (file) => {
    const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(file));
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;

      const { data: { text } } = await Tesseract.recognize(
        canvas,
        'eng',
        {
          logger: (m) => console.log(m),
        }
      );

      fullText += text;
    }

    return fullText;
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handlePDFUpload} />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h2>Extracted Text</h2>
          <p>{text}</p>
        </div>
      )}
    </div>
  );
};

export default PDFTextExtractor;
