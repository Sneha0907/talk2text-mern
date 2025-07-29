// Attempt to get the API URL from Vite's environment variables
let VITE_API_URL = import.meta.env.VITE_API_URL;

// Optional: fallback if VITE_API_URL is not defined
if (!VITE_API_URL) {
  const hostname = window.location.hostname;

  // Check if running locally
  if (hostname === "localhost") {
    VITE_API_URL = "http://localhost:5000"; // Development server
  } else {
    VITE_API_URL = "https://talk2text-backend.onrender.com"; // Production fallback
  }
}

// Export the resolved API base URL
export default VITE_API_URL;
