import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "./Input";
import { supabase } from "../../lib/supabase";

export default function LoginForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      // =====================================================
      // 1. LOGIN
      // =====================================================

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        alert(error.message);
        return;
      }

      if (!data.user) {
        alert("Unable to get logged-in user.");
        return;
      }

      console.log("Logged-in User ID:", data.user.id);

      // =====================================================
      // 2. GET ONLY THIS USER'S PROFILE
      // =====================================================

      const {
        data: userProfile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      console.log("User Profile:", userProfile);
      console.log("Profile Error:", profileError);

      if (profileError) {
        alert(profileError.message);
        return;
      }

      if (!userProfile) {
        alert("Profile not found.");
        return;
      }

      // =====================================================
      // 3. NAVIGATE BASED ON ROLE
      // =====================================================

      switch (userProfile.role) {
        case "super_admin":
          navigate("/super-admin");
          break;

        case "admin":
          navigate("/admin");
          break;

        case "driver":
          navigate("/driver");
          break;

        case "student":
          navigate("/student");
          break;

        case "parent":
          navigate("/parents");
          break;

        default:
          alert("Unknown user role.");
          navigate("/");
      }
    } catch (err: any) {
      console.error("Login error:", err);

      alert(
        err?.message ||
          "Something went wrong during login."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="mb-6 text-3xl font-bold">
        Login
      </h2>

      <Input
        label="Email"
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        type="button"
        onClick={handleLogin}
        disabled={loading}
        className="mt-2 w-full rounded-lg bg-blue-600 py-3 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}