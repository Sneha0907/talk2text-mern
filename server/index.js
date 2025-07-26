require("dotenv").config(); //API keys and secrets in .env (not in code) for security.
const express = require("express"); // Loads the express module. We will use this to create our server and define API routes.
const multer = require("multer"); //Multer is a middleware to handle file uploads in Node.js. When a user uploads an audio file, multer helps us read and store that file.
const cors = require("cors"); // CORS (Cross-Origin Resource Sharing).Allows your frontend (React app) and backend (Node server) to communicate when they are on different domains or ports.
const fs = require("fs"); //FS is a built-in Node.js module for working with the file system.It allows reading, writing, and deleting files on the server.
const speech = require("@google-cloud/speech"); //This loads Google Cloud Speech-to-Text SDK.It will be used to convert the uploaded audio file into text transcription.
const { createClient } = require("@supabase/supabase-js"); //Supabase is a database + authentication service.createClient → Function to create a connection to your Supabase project.

const app = express(); //Creates an instance of an Express application.app is now your server.
const PORT = 5000; //Sets the server port to 5000.When you start the server, it will run at http://localhost:5000.



// Allow requests from React app and parse JSON
app.use(cors({ 
  origin: "http://localhost:5173",  // Allow requests from your frontend
  methods: ["GET", "POST"]  // Allow these HTTP methods
}));   //Your frontend (React) is running on localhost:5173, and your backend is on localhost:5000
app.use(express.json()); //Lets backend read JSON data from frontend



// Initialize Google Speech-to-Text client using credentials
const client = new speech.SpeechClient({ keyFilename: "google-credentials.json" }); //speech.SpeechClient is a class provided by the @google-cloud/speech package.This client will allow your backend to communicate with Google’s Speech-to-Text API.
//keyFilename tells the client where to find your credentials file.This file (google-credentials.json) is downloaded from Google Cloud Console when you create a service account for your project.



// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);



// ✅ Multer setup for file uploads (with type validation)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"), // Save files in 'uploads' folder
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname), // Unique file name
});



// ✅ Allow only audio file types (MP3, WAV)
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["audio/mpeg", "audio/wav", "audio/mp3"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only MP3 and WAV files are allowed."));
    }
  },
});



// ✅ Health Check Endpoint
app.get("/", (req, res) => res.send("✅ API is running..."));



// ✅ Transcription API
app.post("/transcribe", upload.single("audio"), async (req, res) => {

  try {
    // Check if file exists
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Convert audio file to Base64 for Google API
    const filePath = req.file.path;
    const audioBytes = fs.readFileSync(filePath).toString("base64");

    // Google API configuration
    const request = {
      audio: { content: audioBytes },
      config: { encoding: "MP3", sampleRateHertz: 16000, languageCode: "en-US" },
    };

    // ✅ Send audio to Google Speech API
    let transcription;
    try {
      const [response] = await client.recognize(request);
      transcription = response.results.map(r => r.alternatives[0].transcript).join("\n");
    } catch (apiError) {
      console.error("Google API Error:", apiError);
      return res.status(500).json({ error: "Speech-to-Text service failed" });
    }

    // If no text detected
    if (!transcription) return res.status(500).json({ error: "No speech detected in the audio" });

    // ✅ Save transcription into Supabase
    const { data, error } = await supabase
      .from("audio_files")
      .insert([{ file_name: req.file.originalname, transcription, user_id: req.body.user_id }])
      .select();

    if (error) return res.status(500).json({ error: "Failed to save transcription" });

    res.json({ message: "Success", transcription });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message || "Transcription failed" });
  }
});

// Fetch Previous Transcriptions API
app.get("/transcriptions/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const { data, error } = await supabase
    .from("audio_files")
    .select("id, file_name, transcription, created_at")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: "Failed to fetch transcriptions" });
  res.json({ message: "Success", transcriptions: data });
});


app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
