require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const speech = require("@google-cloud/speech");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = 5000;

// ✅ Allow frontend (React Vite) requests & parse JSON
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
}));
app.use(express.json());

// ✅ Google Speech-to-Text Client
const client = new speech.SpeechClient({
  keyFilename: "google-credentials.json", // Ensure the file exists in root
});

// ✅ Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ✅ Multer Setup for File Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ API Health Check
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// ✅ Transcription Route
app.post("/transcribe", upload.single("audio"), async (req, res) => {
  console.log("✅ Received request to /transcribe");

  try {
    if (!req.file) {
      console.error("❌ No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("✅ Uploaded File:", req.file.originalname);
    const filePath = req.file.path;

    // ✅ Convert Audio to Base64
    console.log("🔍 Reading audio file...");
    const audioBytes = fs.readFileSync(filePath).toString("base64");
    console.log("✅ Audio file converted to Base64");

    // ✅ Google Speech-to-Text Request
    const request = {
      audio: { content: audioBytes },
      config: {
        encoding: "MP3", // Change to LINEAR16 for WAV
        sampleRateHertz: 16000,
        languageCode: "en-US",
      },
    };

    console.log("🔍 Sending request to Google Speech API...");
    const [response] = await client.recognize(request);
    console.log("✅ Google API response received");

    // ✅ Extract Transcription
    const transcription = response.results
      .map(r => r.alternatives[0].transcript)
      .join("\n");

    if (!transcription) {
      console.error("❌ No transcription generated");
      return res.status(500).json({ error: "No transcription generated" });
    }

    console.log("✅ Transcription:", transcription);

    // ✅ Save Data in Supabase
    console.log("🔍 Inserting into Supabase...");
    const { data, error } = await supabase
      .from("audio_files")
      .insert([
        {
          file_name: req.file.originalname,
          file_url: "", // Later you can add Supabase Storage URL
          transcription: transcription,
        },
      ])
      .select();

    if (error) {
      console.error("❌ Supabase Insert Error:", error);
      return res.status(500).json({ error: "Failed to save in database" });
    }

    console.log("✅ Data saved in Supabase:", data);

    res.json({ message: "Success", transcription, db: data });

  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Transcription failed" });
  }
});

// ✅ Fetch Previous Transcriptions Route
app.get("/transcriptions", async (req, res) => {
  try {
    console.log("🔍 Fetching previous transcriptions...");
    const { data, error } = await supabase
      .from("audio_files")
      .select("id, file_name, transcription, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching transcriptions:", error);
      return res.status(500).json({ error: "Failed to fetch transcriptions" });
    }

    res.json({ message: "Success", transcriptions: data });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Failed to fetch transcriptions" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
