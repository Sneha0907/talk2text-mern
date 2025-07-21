require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const speech = require("@google-cloud/speech");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = 5000;

// ✅ Allow requests from React app and parse JSON
app.use(cors({ origin: "http://localhost:5173", methods: ["GET", "POST"] }));
app.use(express.json());

// ✅ Initialize Google Speech-to-Text client using credentials
const client = new speech.SpeechClient({ keyFilename: "google-credentials.json" });

// ✅ Initialize Supabase client
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
      .insert([{ file_name: req.file.originalname, file_url: "", transcription }])
      .select();

    if (error) return res.status(500).json({ error: "Failed to save transcription" });

    res.json({ message: "Success", transcription });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message || "Transcription failed" });
  }
});

// ✅ Fetch Previous Transcriptions API
app.get("/transcriptions", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("audio_files")
      .select("id, file_name, transcription, created_at")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: "Failed to fetch transcriptions" });

    res.json({ message: "Success", transcriptions: data });
  } catch {
    res.status(500).json({ error: "Server error while fetching history" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
