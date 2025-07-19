import React, { useState } from "react";
import axios from "axios";

export default function App() {
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("audio", file);

    try {
      setLoading(true);
      setTranscription("");
      
      const response = await axios.post("http://localhost:5000/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setTranscription(response.data.transcription);
      alert("Transcription completed successfully!");
    } catch (error) {
      console.error(error);
      alert("Error uploading file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Talk2Text App</h1>

      <div className="flex items-center gap-4 mb-6">
        <input type="file" accept="audio/*" onChange={handleFileChange} className="text-white" />
        <button
          onClick={handleUpload}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Transcribing..." : "Upload & Transcribe"}
        </button>
      </div>

      <div className="mt-6 w-2/3 bg-gray-800 p-4 rounded">
        <h2 className="text-xl font-semibold">Transcription:</h2>
        <p className="mt-2">{transcription || "No transcription yet"}</p>
      </div>
    </div>
  );
}
