import React, { useState } from 'react';
import './App.css';
import ReportDownloadButton from './components/ReportDownloadButton';

function App() {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [jsonInput, setJsonInput] = useState(JSON.stringify({
    title: "Friend's Project Report",
    generatedAt: "2024-04-01",
    account: "External Client",
    timeRange: "Q2 2024",
    summary: "This report came from a totally different dynamic data source!",
    totalCost: 9999.99,
    services: [
      { name: "Lambda", cost: 200.0, recommendation: "Optimize memory" },
      { name: "DynamoDB", cost: 150.0, recommendation: "Use On-Demand" }
    ]
  }, null, 2));

  const API_BASE_URL = "http://127.0.0.1:8000";

  // Helper for Markdown Upload (since it requires FormData, it's slightly different than JSON)
  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleMarkdownConvert = async (type) => {
    if (!selectedFile) {
      alert("Please select a Markdown file first.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/convert/${type}`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Conversion failed');
      const blob = await response.blob();
      downloadBlob(blob, `converted-report.${type}`);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Detailed Report Generation</h1>

        {/* 1. Reuse Example: Standard Report */}
        <div className="section">
          <h2>Standard Report</h2>
          <p>Reuse Pattern: GET request to existing endpoint.</p>
          <div className="button-group">
            <ReportDownloadButton
              baseUrl={API_BASE_URL}
              endpoint="/export/pdf"
              format="pdf"
              label="Download Standard PDF"
            />
            <ReportDownloadButton
              baseUrl={API_BASE_URL}
              endpoint="/export/docx"
              format="docx"
              label="Download Standard DOCX"
            />
          </div>
        </div>

        {/* 2. Reuse Example: Custom Data */}
        <div className="section">
          <h2>Dynamic Data Report</h2>
          <p>Reuse Pattern: POST request with dynamic JSON.</p>
          <textarea
            rows="8"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
          <div className="button-group">
            <ReportDownloadButton
              baseUrl={API_BASE_URL}
              reportData={JSON.parse(jsonInput)} // Passing the object directly!
              format="pdf"
              label="Generate Dynamic PDF"
            />
            <ReportDownloadButton
              baseUrl={API_BASE_URL}
              reportData={JSON.parse(jsonInput)}
              format="docx"
              label="Generate Dynamic DOCX"
            />
          </div>
        </div>

        {/* 3. Markdown Conversion (Special Case: File Upload) */}
        <div className="section">
          <h2>Markdown Conversion</h2>
          <p>Upload a .md file to convert it.</p>
          <input
            type="file"
            accept=".md"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            style={{ marginBottom: '15px' }}
          />
          <div className="button-group">
            <button onClick={() => handleMarkdownConvert('pdf')} disabled={loading || !selectedFile}>
              Convert to PDF
            </button>
            <button onClick={() => handleMarkdownConvert('docx')} disabled={loading || !selectedFile}>
              Convert to DOCX
            </button>
          </div>
        </div>

      </header>
    </div>
  );
}

export default App;
