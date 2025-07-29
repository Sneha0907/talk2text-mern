import React, { useState, useEffect } from "react";
import axios from "axios";
import supabase from "./supabaseClient";
import API_BASE_URL from "./config";

// Main component
export default function App() {
  // === State declarations ===
  const [file, setFile] = useState(null); // Uploaded file
  const [transcription, setTranscription] = useState(""); // Latest transcription result
  const [loading, setLoading] = useState(false); // Upload state
  const [history, setHistory] = useState([]); // Past transcriptions
  const [errorMessage, setErrorMessage] = useState(""); // Error messages
  const [user, setUser] = useState(null); // Supabase authenticated user

  const [email, setEmail] = useState(""); // Email input
  const [password, setPassword] = useState(""); // Password input
  const [isLogin, setIsLogin] = useState(true); // Toggle login/signup mode

// === On component mount, check Supabase session and load history if logged in ===
  useEffect(() => {
    const checkSessionAndFetch = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data?.session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        await fetchHistory(currentUser.id);
      }
    };

    checkSessionAndFetch();

// Listen to auth state changes (login/logout/signup)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user || null;
      setUser(u);
      if (u) fetchHistory(u.id);
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

// === File input change handler ===
  const handleFileChange = (e) => {
    setErrorMessage("");
    setFile(e.target.files[0]);
  };

// === Upload audio file and get transcription ===
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
      const response = await axios.post(`${API_BASE_URL}/transcribe`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTranscription(response.data.transcription);
      fetchHistory(user.id); // refresh history after new upload
    } catch (error) {
      console.error("Upload failed:", error.response?.data || error.message);
      if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

// === Fetch transcription history from backend ===
  const fetchHistory = async (userId) => {
    if (!userId) return;
    const url = `${API_BASE_URL}/transcriptions/${userId}`;
    console.log("Fetching transcription history from:", url);

    try {
      const res = await axios.get(url);
      console.log("History fetched:", res.data);
      setHistory(res.data.transcriptions);
    } catch (err) {
      console.error("Failed to load history:", err.response?.data || err.message);
      setErrorMessage("Failed to load history");
    }
  };

// === Supabase Auth Handlers ===
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
    setHistory([]);
    setFile(null);
    setTranscription("");
  };

  const handlePasswordReset = async () => {
    if (!email) {
      alert("Please enter your email first.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      alert(error.message);
    } else {
      alert("Password reset link sent to your email!");
    }
  };

// === UI Rendering ===
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-[#1F487E]">Talk2Text</h1>

      {!user ? (
        <div className="max-w-md mx-auto mb-8 bg-white p-6 rounded-xl shadow-lg">
          <div className="flex mb-6 border-b border-gray-300">
            <button
              className={`flex-1 py-3 text-lg font-semibold transition ${
                isLogin ? "border-b-4 border-blue-500 text-blue-600" : "text-gray-500 hover:text-blue-500"
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`flex-1 py-3 text-lg font-semibold transition ${
                !isLogin ? "border-b-4 border-green-500 text-green-600" : "text-gray-500 hover:text-green-500"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
        <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-200">
          <div className="flex justify-center mb-4">
            <div className="bg-[#1F487E] p-4 rounded-full">
              <span className="text-white text-3xl">🎤</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#1F487E] mb-4 text-center">Transcribe your audio file</h2>
          <p className="text-gray-500 mb-6 text-center">Upload an audio file to transcribe.</p>

          <label className="block border-2 border-dashed border-gray-300 rounded-lg py-8 cursor-pointer hover:border-[#247BA0] transition text-center">
            <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
            <p className="text-gray-500">
              <span className="text-[#1F487E] font-semibold">+</span> Click to upload
            </p>
            {file && <p className="text-gray-700 mt-2">{file.name}</p>}
          </label>

          {errorMessage && <p className="text-red-500 mt-4 text-center font-semibold">{errorMessage}</p>}

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

        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-[#1F487E] mb-4">Previous Transcriptions</h2>
          {!user ? (
            <p className="text-gray-500">Login to view your history.</p>
          ) : history.length === 0 ? (
            <p className="text-gray-500">No history available.</p>
          ) : (
            <div className="max-h-[500px] overflow-y-auto space-y-4">
              {history.map((item) => (
                <div key={item.id} className="p-4 border border-gray-200 rounded-lg shadow hover:shadow-lg transition bg-gray-50">
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
