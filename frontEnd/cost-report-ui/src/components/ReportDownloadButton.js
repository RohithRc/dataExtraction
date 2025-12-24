import React, { useState } from 'react';

/**
 * Reusable button to generate/download reports from the DataEx backend.
 * 
 * Props:
 * - baseUrl (string): URL of the backend API (e.g. "http://localhost:8000")
 * - endpoint (string, optional): Specific endpoint to GET (e.g. "/export/pdf")
 * - reportData (object, optional): JSON data to POST for custom reports.
 * - format (string): "pdf" or "docx"
 * - label (string): Text to display on the button
 */
const ReportDownloadButton = ({ baseUrl, endpoint, reportData, format, label }) => {
    const [loading, setLoading] = useState(false);

    const handleAction = async () => {
        setLoading(true);
        try {
            let response;
            const url = `${baseUrl}${endpoint || `/report/custom/${format}`}`;

            if (reportData) {
                // POST request with Custom Data
                response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reportData)
                });
            } else {
                // GET request for Standard/Static Endpoint
                response = await fetch(url);
            }

            if (!response.ok) throw new Error('Report generation failed');

            // Handle Blob Download
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `report-${Date.now()}.${format}`; // Unique filename
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);

        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button onClick={handleAction} disabled={loading} style={styles.button}>
            {loading ? 'Generating...' : label || `Download ${format.toUpperCase()}`}
        </button>
    );
};

const styles = {
    button: {
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        backgroundColor: '#61dafb',
        border: 'none',
        borderRadius: '4px',
        color: '#282c34',
        fontWeight: 'bold',
        margin: '0 5px',
        transition: 'opacity 0.2s'
    }
};

export default ReportDownloadButton;
