import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      const data = await login(form);
      const destination = data.user.role === "ADMIN"
        ? "/admin/dashboard"
        : location.state?.from || "/";
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[32px] bg-white p-8 shadow-sm lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">Account</p>
        <h1 className="mt-3 text-4xl font-semibold text-stone-900">Login</h1>
        <p className="mt-3 text-stone-600">Sign in to book appointments and manage your bookings.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            className="h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 outline-none focus:border-rose-300"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            className="h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 outline-none focus:border-rose-300"
            required
          />
          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-sm text-stone-600">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-rose-600">Register</Link>
        </p>

        <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
          <p className="font-semibold text-stone-900">Default admin account</p>
          <p>Email: admin@suspa.local</p>
          <p>Password: Admin@123</p>
        </div>
      </div>
    </div>
  );
}
