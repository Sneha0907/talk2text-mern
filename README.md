# Project Overview

**Talk2Text** is a full-stack web application that allows users to transcribe audio files into text using Google Cloud's Speech-to-Text API. It provides secure authentication through Supabase and stores user-specific transcription history for future reference.

## Features

- Upload `.mp3` or `.wav` audio files for transcription
- User authentication (Signup/Login/Logout) with Supabase
- Real-time transcription using Google Speech-to-Text
- View previous transcription history
- Fully deployed frontend (Vercel) and backend (Render)
- Responsive and clean user interface built with React + Tailwind CSS

## Tech Stack

This project is built using a modern full-stack JavaScript ecosystem with powerful tools and services integrated for authentication, storage, and machine learning capabilities.

### Frontend
- **React (with Vite):** Used for building the user interface with a fast, modern development experience. Vite provides lightning-fast hot module replacement (HMR), optimized builds, and efficient local development.
- **Tailwind CSS:** A utility-first CSS framework that allows rapid UI development with clean and responsive designs without writing traditional CSS.

### Backend
- **Node.js + Express:** The backend server is built with Express, a minimal and flexible Node.js framework. It handles audio file uploads, communicates with external APIs, and serves transcription history.

### Speech-to-Text Service
- **Google Cloud Speech-to-Text API:** Provides highly accurate transcription services. The backend sends uploaded audio files to this API and retrieves transcribed text, which is then stored and returned to the frontend.

### Authentication & Database
- **Supabase:**
  - **Authentication:** Used for secure user sign-up, login, logout, session management, and password reset.
  - **Database:** Stores the transcription history tied to individual user accounts, including metadata like file names and timestamps.

### Hosting & Deployment
- **Render:** Hosts the Express backend server. It supports automatic deployment from Git repositories and handles API requests and file uploads.
- **Vercel:** Hosts the React frontend. It provides fast, global CDN delivery, supports environment variables, and offers an easy CI/CD pipeline with GitHub integration.


## Folder Structure

```bash
/client                  # React frontend powered by Vite
  ├── public/            # Static assets like favicon, manifest
  ├── src/               # Main React code (App.jsx, components, config.js, etc.)
  ├── .env               # Contains VITE_API_URL for API communication
  ├── index.html         # HTML template used by Vite
  └── vite.config.js     # Vite configuration file

/server                  # Node.js backend using Express
  ├── index.js           # Main server file (API routes and logic)
  ├── uploads/           # Temporary folder to store uploaded audio files
  ├── .env               # Contains Supabase and Google Cloud environment variables
  └── google-credentials.json  # Google Cloud service account credentials

.gitignore               # Prevents sensitive files like .env and node_modules from being committed

README.md                # Documentation file (this one)
```

## Setup Instructions

### A. Prerequisites

Before you begin, ensure you have the following accounts and tools configured:

1. **Node.js (v18 or above)**
   - Make sure you have Node.js installed on your system.
   - You can check the version with:
     ```bash
     node -v
     npm -v
     ```

2. **Supabase Account**
   - Create an account at [https://supabase.com](https://supabase.com).
   - Set up a new project and retrieve:
     - Supabase URL
     - Supabase Public API Key
   - Enable **Authentication** and **Database** features.

3. **Google Cloud Platform Account**
   - Go to [https://console.cloud.google.com](https://console.cloud.google.com) and create a project.
   - Enable the **Speech-to-Text API**.
   - Generate a **service account key** in JSON format and download it securely.
   - This will be used in the backend to authenticate API requests.

---

### B. Backend Setup

Follow the steps below to configure and run the backend server:

1. **Navigate to the `server/` directory**

   ```bash
   cd server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   This installs all required Node.js packages listed in `package.json`.

3. **Create a `.env` file** in the `server/` directory and add the following environment variables:

   ```ini
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   GOOGLE_APPLICATION_CREDENTIALS=google-credentials.json
   ```

   * Replace `your_supabase_url` with your actual Supabase project URL.
   * Replace `your_supabase_anon_key` with your public API key from Supabase.
   * The `google-credentials.json` file must contain the service account credentials downloaded from Google Cloud and must be placed in the same `server/` directory.

4. **Start the backend server**

   ```bash
   node index.js
   ```

   By default, the server will run on [http://localhost:5000](http://localhost:5000). Make sure this port is open and not used by other services.

---

### C. Frontend Setup

Follow these steps to configure and run the React frontend:

1. **Navigate to the `client/` directory**

   ```bash
   cd client
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

   This installs all required packages listed in the frontend `package.json`.

3. **Create a `.env` file** in the `client/` directory and add the following environment variable:

   ```ini
   VITE_API_URL=http://localhost:5000
   ```

   * This tells the frontend where to send API requests during local development.
   * When deployed, this will fallback to the hosted backend URL (e.g., Render) using logic in `config.js`.

4. **Run the frontend in development mode**

   ```bash
   npm run dev
   ```

   The app will start on [http://localhost:5173](http://localhost:5173) by default.

---

### D. Run Locally

To run the project locally with both backend and frontend:

1. **Start the Backend**

   Open one terminal and run:

   ```bash
   cd server
   node index.js
   ```

   This starts the Express server on [http://localhost:5000](http://localhost:5000).

2. **Start the Frontend**

   Open another terminal and run:

   ```bash
   cd client
   npm run dev
   ```

   This starts the React app on [http://localhost:5173](http://localhost:5173).


## Deployment

#### Backend Deployment (Render)

1. **Connect GitHub Repository**

   * Log in to [https://render.com](https://render.com).
   * Click **"New Web Service"** and connect your GitHub repo.
   * Choose the backend folder (e.g., `server`).

2. **Configure Build Settings**

   * **Build Command**:

     ```
     npm install
     ```
   * **Start Command**:

     ```
     node index.js
     ```

3. **Set Environment Variables**
   Add these in the **Render Dashboard → Environment → Add Environment Variables**:

   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   GOOGLE_APPLICATION_CREDENTIALS=google-credentials.json
   ```

   *(Make sure the `google-credentials.json` file is uploaded to Render via the dashboard or startup script if needed)*

---

#### Frontend Deployment (Vercel)

1. **Connect GitHub Repository**

   * Go to [https://vercel.com](https://vercel.com) and import the frontend (e.g., `client`) folder.

2. **Add Environment Variable**

   In the Vercel project settings, add:

   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```

3. **Deploy**

   * Click **Deploy**. Vercel will automatically build and host the site.


## API Usage

#### POST `/transcribe`

Transcribes an uploaded audio file.

* **Request:**

  * Method: `POST`
  * Content-Type: `multipart/form-data`
  * Body:

    * `audio`: The audio file (MP3 or WAV)
    * `user_id`: Supabase user ID

* **Response:**

  ```json
  {
    "transcription": "Transcribed text here"
  }
  ```

---

#### GET `/transcriptions/:user_id`

Fetches all transcriptions associated with the given Supabase user ID.

* **Request:**

  * Method: `GET`
  * Params:

    * `:user_id`: Supabase user ID

* **Response:**

  ```json
  {
    "transcriptions": [
      {
        "id": 1,
        "file_name": "example.mp3",
        "transcription": "Text from audio",
        "created_at": "2025-07-28T12:34:56.789Z"
      },
      ...
    ]
  }
  ```

---

#### Authentication

* Uses **Supabase email/password authentication**.
* JWT tokens are automatically handled via Supabase client in the frontend.


## Testing

To verify that all core functionalities are working as expected:

1. **Audio Upload**

   * Upload a valid `.mp3` or `.wav` file using the UI.
   * Confirm that the transcription appears below the upload panel.

2. **Transcription History**

   * After a successful upload, check the **"Previous Transcriptions"** section.
   * It should list the uploaded file with the generated transcription and timestamp.

3. **Authentication**

   * **Signup** with a new email/password.
   * **Login** using the registered credentials.
   * **Logout** to verify session is cleared.
   * Use **"Forgot Password?"** to test the password reset flow.


## Features

* **Upload & Transcribe Audio**

  * Users can upload `.mp3` or `.wav` audio files.
  * The backend uses Google Cloud's Speech-to-Text API to convert speech to text.

* **Authentication with Supabase**

  * Users can sign up, log in, log out, and reset passwords using Supabase Auth.
  * Authentication state is persisted and used to link transcriptions to each user.

* **Transcription History Tracking**

  * Each transcription is saved in Supabase.
  * Logged-in users can view a scrollable panel of all past transcription results.

* **Error Handling & Responsive UI**

  * Friendly error messages are shown for invalid files, failed uploads, or API issues.
  * Mobile-friendly layout using Tailwind CSS for a seamless experience across devices.


## Future Improvements

* **Audio Playback**

  * Add a player to listen to the uploaded audio alongside its transcription.

* **Download Transcripts**

  * Provide an option to download the transcribed text as `.txt` or `.pdf` files.

* **Role-Based Access / Admin Mode**

  * Add admin-level features to view all transcriptions.
  * Enable analytics or moderation tools for specific user roles.









