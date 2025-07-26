const API_BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://talk2text-backend.onrender.com"
    : "http://localhost:5000";

export default API_BASE_URL;
