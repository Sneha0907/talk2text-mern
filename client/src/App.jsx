import React, { useState, useEffect } from "react"; //The main React library that we need to build components.
                                                    // useState → Used to store and manage data (state) in a component.
                                                    //useEffect → Used to run side effects (like fetching data or listening for changes).
import axios from "axios";   //making HTTP requests (GET, POST, etc.) to servers.



export default function App() { //Defines a function component named App.

  // States for file, transcription, loading, history, and error message

  const [file, setFile] = useState(null);  //declaring a state variable called file using useState().
                                           //When the user uploads a file, we’ll call setFile(selectedFile).
  const [transcription, setTranscription] = useState(""); //A variable to store the text transcription.
  const [loading, setLoading] = useState(false); //A boolean (true/false) to show if the app is processing.
  const [history, setHistory] = useState([]); //An array to store previous transcriptions.
  const [errorMessage, setErrorMessage] = useState(""); //A string to show any error messages.



  useEffect(() => {
    fetchHistory(); // Load history on page load
  }, []);



  // Handle file selection
  const handleFileChange = (e) => {
    setErrorMessage(""); // Clear old error message
    setFile(e.target.files[0]); // Updates the state variable file with the selected file.
  };



  // Upload file and request transcription
  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("Please select a file first!");
      return;
    }



    // ✅ Validate file type on frontend
    const allowedTypes = ["audio/mpeg", "audio/wav", "audio/mp3"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Invalid file type. Please upload an MP3 or WAV file.");
      return;
    }



    const formData = new FormData();
    formData.append("audio", file);

    setLoading(true);
    setErrorMessage("");
    setTranscription("");

    try {
      // ✅ Send request to backend
      const response = await axios.post("http://localhost:5000/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTranscription(response.data.transcription);
      fetchHistory(); // Refresh history after new transcription
    } catch (error) {
      // ✅ Show user-friendly error
      if (error.response && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };



  // Fetch transcription history
  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/transcriptions");
      setHistory(res.data.transcriptions);
    } catch {
      setErrorMessage("Failed to load history");
    }
  };



  return (
    <div className="min-h-screen bg-white text-gray-900 p-8">
      {/* Title */}
      <h1 className="text-4xl font-bold text-center mb-8 text-[#1F487E]">Talk2Text</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
        {/* Upload Section */}
        <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-200">
          <div className="flex justify-center mb-4">
            <div className="bg-[#1F487E] p-4 rounded-full">
              <span className="text-white text-3xl">🎤</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#1F487E] mb-2 text-center">Transcribe your audio file</h2>
          <p className="text-gray-500 mb-6 text-center">Upload an audio file to transcribe.</p>

          {/* File Upload */}
          <label className="block border-2 border-dashed border-gray-300 rounded-lg py-8 cursor-pointer hover:border-[#247BA0] transition text-center">
            <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
            <p className="text-gray-500">
              <span className="text-[#1F487E] font-semibold">+</span> Click to upload
            </p>
            {file && <p className="text-gray-700 mt-2">{file.name}</p>}
          </label>

          {/* Error Message */}
          {errorMessage && <p className="text-red-500 mt-4 text-center font-semibold">{errorMessage}</p>}

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
            <div className="mt-6 bg-gray-100 rounded-lg p-4">
              <h3 className="text-[#1F487E] font-semibold mb-2">Latest Transcription:</h3>
              <p>{transcription}</p>
            </div>
          )}
        </div>

        {/* History Section */}
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
