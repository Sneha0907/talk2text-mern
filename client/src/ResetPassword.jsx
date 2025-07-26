import React, { useState } from "react";
import supabase from "./supabaseClient";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated successfully! You can now log in.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
        <input
          type="password"
          placeholder="New Password"
          className="border border-gray-300 rounded-lg p-3 w-full mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleReset}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg w-full"
        >
          Update Password
        </button>
        {message && <p className="text-center mt-4 text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
