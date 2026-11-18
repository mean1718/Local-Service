import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Auth({ onAuthSuccess }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function getSavedUsers() {
    try {
      const raw = localStorage.getItem("lsf_users");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    const cleanContact = emailOrPhone.trim();
    const cleanPassword = password.trim();
    const cleanName = name.trim();

    if (!cleanContact || !cleanPassword) {
      setError("Please fill in your email/phone and password.");
      return;
    }

    if (cleanPassword.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    const savedUsers = getSavedUsers();

    if (mode === "register") {
      if (!cleanName) {
        setError("Please enter your full name to register.");
        return;
      }

      const alreadyExists = savedUsers.some(
        (u) => u.contact.toLowerCase() === cleanContact.toLowerCase()
      );
      if (alreadyExists) {
        setError("An account with this email or phone already exists. Please log in.");
        return;
      }

      const newUser = {
        name: cleanName,
        contact: cleanContact,
        password: cleanPassword,
      };

      const updatedUsers = [...savedUsers, newUser];

      try {
        localStorage.setItem("lsf_users", JSON.stringify(updatedUsers));
        localStorage.setItem(
          "lsf_current_user",
          JSON.stringify({ name: newUser.name, contact: newUser.contact })
        );
      } catch {
        // Ignore storage errors in restricted environments.
      }

      setMessage(`Account created for ${newUser.name}.`);
      if (onAuthSuccess) {
        onAuthSuccess({ name: newUser.name, contact: newUser.contact });
      }
      navigate("/home");
      return;
    }

    // Login mode: check saved account and password
    const matchedUser = savedUsers.find(
      (u) => u.contact.toLowerCase() === cleanContact.toLowerCase()
    );

    if (!matchedUser) {
      setError("No account found with this email or phone. Please register first.");
      return;
    }

    if (matchedUser.password !== cleanPassword) {
      setError("Incorrect password. Please try again.");
      return;
    }

    const activeUser = {
      name: matchedUser.name,
      contact: matchedUser.contact,
    };

    try {
      localStorage.setItem("lsf_current_user", JSON.stringify(activeUser));
    } catch {
      // Ignore storage errors in restricted environments.
    }

    setMessage(`Logged in as ${activeUser.name}.`);
    if (onAuthSuccess) {
      onAuthSuccess(activeUser);
    }
    navigate("/home");
  }

  return (
    <div className="mx-auto max-w-md pt-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex rounded-xl bg-zinc-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
              setMessage("");
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              mode === "login"
                ? "bg-amber-500 text-white"
                : "text-zinc-700 hover:text-zinc-900"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
              setMessage("");
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              mode === "register"
                ? "bg-amber-500 text-white"
                : "text-zinc-700 hover:text-zinc-900"
            }`}
          >
            Register
          </button>
        </div>

        <h1 className="text-xl font-bold text-zinc-900">
          {mode === "login" ? "Welcome back" : "Create an account"}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {mode === "login"
            ? "Sign in to find or post local services."
            : "Register to manage your services and activity."}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sokha Chan"
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-amber-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Email or Phone
            </label>
            <input
              type="text"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="e.g. 012 345 678 or name@email.com"
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          {message && (
            <p className="text-sm font-medium text-emerald-600">{message}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
          >
            {mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}