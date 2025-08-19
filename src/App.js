import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import './App.css';

function App() {
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('eng'); // default English

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    handleFileUpload(file);
  };

  const handleFileUpload = async (file) => {
    setLoading(true);
    setExtractedText('');
    const formData = new FormData();
    formData.append('image', file);
    formData.append('lang', selectedLanguage);

    try {
      const response = await fetch('https://doc-my-1.onrender.com/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Server error ${response.status}`);
      }
      const data = await response.json();
      setExtractedText(data.text || 'No text extracted');
    } catch (error) {
      console.error('Fetch error:', error);
      setExtractedText('Error processing image');
    }
    setLoading(false);
  };

  const saveAsPDF = () => {
    if (!extractedText.trim()) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const maxLineWidth = pageWidth - margin * 2;
    const splitText = doc.splitTextToSize(extractedText, maxLineWidth);
    doc.text(splitText, margin, 20);
    doc.save('extracted-text.pdf');
  };

  return (
    <div className="app-container">
      <h1>Document Organizer</h1>
      <div className="upload-section">
        <label className="upload-button" htmlFor="upload-input" aria-disabled={loading}>
          Upload Image
        </label>
        <input
          id="upload-input"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          disabled={loading}
        />
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          disabled={loading}
          aria-label="Select OCR language"
          style={{ marginLeft: '10px' }}
        >
          <option value="eng">English</option>
          <option value="hin">Hindi</option>
          <option value="spa">Spanish</option>
          <option value="fra">French</option>
          <option value="deu">German</option>
          {/* Add more supported languages */}
        </select>
        <p className="upload-info">
          Please upload clear images of documents or text with good lighting and minimal blur for best results.
        </p>
      </div>
      <div className="content-split">
        <div className="left-pane">
          {preview ? (
            <img src={preview} alt="Preview" className="image-preview fade-in" />
          ) : (
            <div className="placeholder">Image preview will appear here</div>
          )}
        </div>
        <div className="right-pane">
          {loading ? (
            <div className="loader-container">
              <div className="loader"></div>
              <div>Processing...</div>
            </div>
          ) : (
            <div className="extracted-text fade-in">{extractedText}</div>
          )}
        </div>
      </div>
      <div className="save-button-wrapper">
        <button
          className="save-pdf-button"
          disabled={!extractedText.trim()}
          onClick={saveAsPDF}
          title={extractedText.trim() ? "Save extracted text as PDF" : "No text to save"}
        >
          Save
        </button>
      </div>
      <footer className="footer-signature">© TUSHAR YADAV</footer>
    </div>
  );
}

export default App;
