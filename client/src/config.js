let VITE_API_URL = import.meta.env.VITE_API_URL;

// Optional: fallback based on hostname
if (!VITE_API_URL) {
  const hostname = window.location.hostname;
  if (hostname === "localhost") {
    VITE_API_URL = "http://localhost:5000";
  } else {
    VITE_API_URL = "https://talk2text-backend.onrender.com";
  }
}

export default VITE_API_URL;
