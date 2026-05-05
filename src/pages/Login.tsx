import { useState, useEffect } from "react";

import {
  login,
  isAuthenticated
} from "@/services/auth";

export default function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ si ya está logueado
  useEffect(() => {

    if (isAuthenticated()) {
      window.location.href = "/";
    }

  }, []);

  const handleLogin = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    setError("");

    // ✅ validar campos
    if (!username || !password) {

      setError(
        "Completa usuario y contraseña"
      );

      return;
    }

    setLoading(true);

    try {

      // ✅ login backend
      await login(
        username,
        password
      );

      // ✅ redireccionar
      window.location.href = "/";

    } catch (err: any) {

      setError(
        err.message ||
        "Error de autenticación"
      );

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">

      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-xl w-80 space-y-5"
      >

        <h2 className="text-2xl font-bold text-center text-gray-800">
          🔐 Iniciar Sesión
        </h2>

        {/* USER */}
        <div>

          <label className="block text-sm text-gray-600 mb-1">
            Usuario
          </label>

          <input
            type="text"
            placeholder="admin"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            className="w-full p-2 border border-gray-300 rounded-lg 
            text-gray-800 bg-gray-50 
            focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        {/* PASSWORD */}
        <div>

          <label className="block text-sm text-gray-600 mb-1">
            Contraseña
          </label>

          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full p-2 border border-gray-300 rounded-lg 
            text-gray-800 bg-gray-50 
            focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        {/* ERROR */}
        {error && (

          <p className="text-red-500 text-sm text-center">
            {error}
          </p>

        )}

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 rounded-lg text-white font-semibold transition
          ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >

          {
            loading
              ? "Ingresando..."
              : "Entrar"
          }

        </button>

      </form>

    </div>
  );
}