import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PHONE_MAX_LENGTH = 15;
const PHONE_REGIONS = [
  { code: "VN", label: "Vietnam (+84)" },
  { code: "US", label: "United States (+1)" },
  { code: "GB", label: "United Kingdom (+44)" },
];

function normalizePhoneInput(value) {
  return value.replace(/\D/g, "").slice(0, PHONE_MAX_LENGTH);
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    region: "VN",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      await register({
        ...form,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: normalizePhoneInput(form.phone),
        region: form.region,
      });

      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Register failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[32px] bg-white p-8 shadow-sm lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">
          Account
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-stone-900">Register</h1>
        <p className="mt-3 text-stone-600">
          Create your SuSpa customer account.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="text"
            placeholder="Full name"
            value={form.fullName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, fullName: e.target.value }))
            }
            className="h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 outline-none focus:border-rose-300"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
            className="h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 outline-none focus:border-rose-300"
            required
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[170px_1fr]">
            <select
              value={form.region}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, region: e.target.value }))
              }
              className="h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 outline-none focus:border-rose-300"
            >
              {PHONE_REGIONS.map((region) => (
                <option key={region.code} value={region.code}>
                  {region.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="Phone number"
              value={form.phone}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  phone: normalizePhoneInput(e.target.value),
                }))
              }
              className="h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 outline-none focus:border-rose-300"
              maxLength={PHONE_MAX_LENGTH}
            />
          </div>

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, password: e.target.value }))
            }
            className="h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 outline-none focus:border-rose-300"
            required
          />

          <input
            type="password"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
            }
            className="h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 outline-none focus:border-rose-300"
            required
          />

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-sm text-stone-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-rose-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
