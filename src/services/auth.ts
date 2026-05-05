import { apiClient } from "@/services/api";

const API_URL = "http://127.0.0.1:8000/api";

export interface LoginResponse {
  access_token: string;
  token_type: string;
  username?: string;
}

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!res.ok) {
    throw new Error("Credenciales incorrectas");
  }

  const data: LoginResponse = await res.json();

  // ✅ guardar token
  localStorage.setItem(
    "token",
    data.access_token
  );

  // ✅ guardar usuario
  localStorage.setItem(
    "username",
    username
  );

  // ✅ conectar token con api client
  apiClient.setToken(
    data.access_token
  );

  return data;
}

export function logout() {

  localStorage.removeItem("token");

  localStorage.removeItem("username");

  window.location.href = "/login";
}

export function isAuthenticated(): boolean {

  const token = localStorage.getItem("token");

  return !!token;
}

export function getToken(): string | null {

  return localStorage.getItem("token");
}

export function getUsername(): string {

  return localStorage.getItem("username") || "admin";
}