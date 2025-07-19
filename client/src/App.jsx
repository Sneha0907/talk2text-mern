import React, { useState, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");

    const formData = new FormData();
    formData.append("audio", file);

    try {
      setLoading(true);
      setTranscription("");
      const response = await axios.post("http://localhost:5000/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTranscription(response.data.transcription);
      fetchHistory();
    } catch (error) {
      alert("Error uploading file");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/transcriptions");
      setHistory(res.data.transcriptions);
    } catch (error) {
      console.error("Error fetching history", error);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 p-8">
      {/* App Name */}
      <h1 className="text-4xl font-bold text-center mb-8 text-[#1F487E]">
        Talk2Text App
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
        {/* Left Side - Upload & Latest Transcription */}
        <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-200">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-[#1F487E] p-4 rounded-full">
              <span className="text-white text-3xl">🎤</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-[#1F487E] mb-2 text-center">
            Transcribe your audio file
          </h2>
          <p className="text-gray-500 mb-6 text-center">
            Upload an audio file from your device to transcribe.
          </p>

          {/* Upload Box */}
          <label className="block border-2 border-dashed border-gray-300 rounded-lg py-8 cursor-pointer hover:border-[#247BA0] transition text-center">
            <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
            <p className="text-gray-500">
              <span className="text-[#1F487E] font-semibold">+</span> Click to upload and transcribe
            </p>
            {file && <p className="text-gray-700 mt-2">{file.name}</p>}
          </label>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            className="mt-6 w-full bg-[#1F487E] hover:bg-[#247BA0] text-white font-semibold py-3 rounded-lg transition duration-300"
            disabled={loading}
          >
            {loading ? "Transcribing..." : "Start Transcription"}
          </button>

          {/* Latest Transcription */}
          {transcription && (
            <div className="mt-6 bg-gray-100 rounded-lg p-4 text-left">
              <h3 className="text-[#1F487E] font-semibold mb-2">Latest Transcription:</h3>
              <p className="text-gray-700">{transcription}</p>
            </div>
          )}
        </div>

        {/* Right Side - History Section */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-[#1F487E] mb-4">Previous Transcriptions</h2>
          {history.length === 0 ? (
            <p className="text-gray-500">No history available.</p>
          ) : (
            <div className="max-h-[500px] overflow-y-auto space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 rounded-lg shadow hover:shadow-lg transition bg-gray-50"
                >
                  <strong className="text-gray-800">{item.file_name}</strong>
                  <p className="text-gray-600 mt-1">{item.transcription}</p>
                  <span className="text-xs text-gray-400 mt-2 block">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
