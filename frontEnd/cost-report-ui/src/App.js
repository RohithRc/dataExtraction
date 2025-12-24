import React, { useState } from 'react';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [jsonInput, setJsonInput] = useState(JSON.stringify({
    title: "Custom Report",
    generatedAt: "2024-03-24",
    account: "Client Account A",
    timeRange: "Q1 2024",
    summary: "Quarterly review of infrastructure costs.",
    totalCost: 1250.00,
    services: [
      { name: "EC2", cost: 800.0, recommendation: "Purchase Savings Plans for steady workloads" },
      { name: "S3", cost: 150.0, recommendation: "Enable Intelligent Tiering" },
      { name: "RDS", cost: 300.0, recommendation: "Stop idle development instances" }
    ]
  }, null, 2));

  // --- Helpers ---
  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // --- Handlers ---
  const handleDownload = async (endpoint, filename) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000${endpoint}`);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      downloadBlob(blob, filename);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomDownload = async (type) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/report/custom/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonInput
      });
      if (!response.ok) throw new Error('Generation failed');
      const blob = await response.blob();
      downloadBlob(blob, `custom-report.${type}`);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
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
      const response = await fetch(`http://127.0.0.1:8000/convert/${type}`, {
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

        {/* 1. Standard Report */}
        <div className="section">
          <h2>Standard Report</h2>
          <p>Generate report from live system data (Dummy).</p>
          <div className="button-group">
            <button onClick={() => handleDownload('/export/pdf', 'report.pdf')} disabled={loading}>
              Download PDF
            </button>
            <button onClick={() => handleDownload('/export/docx', 'report.docx')} disabled={loading}>
              Download DOCX
            </button>
          </div>
        </div>

        {/* 2. Custom JSON Report */}
        <div className="section">
          <h2>Custom JSON Report</h2>
          <textarea
            rows="8"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
          <div className="button-group">
            <button onClick={() => handleCustomDownload('pdf')} disabled={loading}>
              Generate PDF
            </button>
            <button onClick={() => handleCustomDownload('docx')} disabled={loading}>
              Generate DOCX
            </button>
          </div>
        </div>

        {/* 3. Markdown Conversion */}
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
