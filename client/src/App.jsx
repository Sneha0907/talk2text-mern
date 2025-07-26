import React, { useState, useEffect } from "react";
import axios from "axios";
import supabase from "./supabaseClient";

export default function App() {
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [user, setUser] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) setUser(data.session.user);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  const handleFileChange = (e) => {
    setErrorMessage("");
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("Please select a file first!");
      return;
    }

    if (!user) {
      setErrorMessage("Please log in to upload a file.");
      return;
    }

    const allowedTypes = ["audio/mpeg", "audio/wav", "audio/mp3"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Invalid file type. Please upload an MP3 or WAV file.");
      return;
    }

    const formData = new FormData();
    formData.append("audio", file);
    formData.append("user_id", user.id);

    setLoading(true);
    setErrorMessage("");
    setTranscription("");

    try {
      const response = await axios.post("http://localhost:5000/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTranscription(response.data.transcription);
      fetchHistory();
    } catch (error) {
      if (error.response && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/transcriptions/${user.id}`);
      setHistory(res.data.transcriptions);
    } catch {
      setErrorMessage("Failed to load history");
    }
  };

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Signup successful! Please check your email.");
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  const handleLogout = async () => {
  await supabase.auth.signOut();
  setUser(null);
  setHistory([]); // ✅ Clear previous history
  setFile(null); // ✅ Optional: Reset file
  setTranscription(""); // ✅ Optional: Clear last transcription
};


  const handlePasswordReset = async () => {
    if (!email) {
      alert("Please enter your email first.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/reset-password",
    });
    if (error) {
      alert(error.message);
    } else {
      alert("Password reset link sent to your email!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-[#1F487E]">Talk2Text</h1>

      {!user ? (
        <div className="max-w-md mx-auto mb-8 bg-white p-6 rounded-xl shadow-lg">
          <div className="flex mb-6 border-b border-gray-300">
            <button
              className={`flex-1 py-3 text-lg font-semibold transition ${
                isLogin
                  ? "border-b-4 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-blue-500"
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`flex-1 py-3 text-lg font-semibold transition ${
                !isLogin
                  ? "border-b-4 border-green-500 text-green-600"
                  : "text-gray-500 hover:text-green-500"
              }`}
              onClick={() => setIsLogin(false)}
            >
              Signup
            </button>
          </div>

          <input
            type="email"
            placeholder="Email"
            className="border border-gray-300 rounded-lg p-3 w-full mb-4 focus:ring-2 focus:ring-blue-400 outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="border border-gray-300 rounded-lg p-3 w-full mb-4 focus:ring-2 focus:ring-blue-400 outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />

          {isLogin ? (
            <>
              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow mb-4"
              >
                Login
              </button>
              <p
                onClick={handlePasswordReset}
                className="text-blue-600 text-sm cursor-pointer hover:underline text-center"
              >
                Forgot Password?
              </p>
            </>
          ) : (
            <button
              onClick={handleSignup}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow"
            >
              Signup
            </button>
          )}
        </div>
      ) : (
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-700 font-medium">
            Logged in as <span className="font-bold">{user.email}</span>
          </p>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      )}

      {/* Upload & History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
        {/* Upload Section */}
        <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-200">
          {/* ✅ Mic Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-[#1F487E] p-4 rounded-full">
              <span className="text-white text-3xl">🎤</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#1F487E] mb-4 text-center">
            Transcribe your audio file
          </h2>
          <p className="text-gray-500 mb-6 text-center">
            Upload an audio file to transcribe.
          </p>

          <label className="block border-2 border-dashed border-gray-300 rounded-lg py-8 cursor-pointer hover:border-[#247BA0] transition text-center">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-gray-500">
              <span className="text-[#1F487E] font-semibold">+</span> Click to upload
            </p>
            {file && <p className="text-gray-700 mt-2">{file.name}</p>}
          </label>

          {errorMessage && (
            <p className="text-red-500 mt-4 text-center font-semibold">{errorMessage}</p>
          )}

          <button
            onClick={handleUpload}
            className="mt-6 w-full bg-[#1F487E] hover:bg-[#247BA0] text-white font-semibold py-3 rounded-lg transition duration-300"
            disabled={loading || !user}
          >
            {loading ? "Transcribing..." : "Start Transcription"}
          </button>

          {transcription && (
            <div className="mt-6 bg-gray-100 rounded-lg p-4">
              <h3 className="text-[#1F487E] font-semibold mb-2">Latest Transcription:</h3>
              <p>{transcription}</p>
            </div>
          )}
        </div>

        {/* History Section */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-[#1F487E] mb-4">
            Previous Transcriptions
          </h2>
          {!user ? (
            <p className="text-gray-500">Login to view your history.</p>
          ) : history.length === 0 ? (
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
