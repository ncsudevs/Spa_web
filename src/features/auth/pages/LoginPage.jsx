import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FormErrorAlert from "../../../shared/components/FormErrorAlert";
import { useAuth } from "../../../context/useAuth";
import useFormErrorAssist, {
  focusAndScrollField,
} from "../../../shared/hooks/useFormErrorAssist";
import {
  getApiFieldIssues,
  getAuthFieldIssueFromMessage,
  getAuthGeneralErrorMessage,
  getNativeFieldIssue,
} from "../../../shared/utils/formErrorMessages";

const FIELD_LABELS = {
  email: "email address",
  password: "password",
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { errorRef, formProps, skipNextErrorScroll } = useFormErrorAssist(error);

  function clearFieldError(fieldName) {
    setFieldErrors((current) => {
      if (!current[fieldName]) return current;
      const next = { ...current };
      delete next[fieldName];
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const nativeIssue = getNativeFieldIssue(
      e.currentTarget.querySelector(":invalid"),
      FIELD_LABELS,
    );

    if (nativeIssue) {
      setError("");
      setFieldErrors({ [nativeIssue.field]: nativeIssue.message });
      const invalidField = e.currentTarget.querySelector(
        `[name="${nativeIssue.field}"]`,
      );
      focusAndScrollField(invalidField);
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setFieldErrors({});
      const data = await login(form);
      const destination = ["ADMIN", "CASHIER"].includes(data.user.role)
        ? "/admin/dashboard"
        : location.state?.from || "/";
      navigate(destination, { replace: true });
    } catch (err) {
      const nextFieldErrors = getApiFieldIssues(err, FIELD_LABELS);

      if (Object.keys(nextFieldErrors).length > 0) {
        const [firstField] = Object.keys(nextFieldErrors);
        setFieldErrors(nextFieldErrors);
        const target = e.currentTarget.querySelector(`[name="${firstField}"]`);
        if (focusAndScrollField(target)) {
          skipNextErrorScroll();
        }
        return;
      }

      const singleFieldIssue = getAuthFieldIssueFromMessage(err, FIELD_LABELS);
      if (singleFieldIssue) {
        setFieldErrors({ [singleFieldIssue.field]: singleFieldIssue.message });
        const target = e.currentTarget.querySelector(
          `[name="${singleFieldIssue.field}"]`,
        );
        if (focusAndScrollField(target)) {
          skipNextErrorScroll();
        }
        return;
      }

      setError(getAuthGeneralErrorMessage(err, "Login failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  function handleInvalidCapture(event) {
    formProps.onInvalidCapture?.(event);
    const issue = getNativeFieldIssue(event.target, FIELD_LABELS);
    if (issue) {
      setError("");
      setFieldErrors({ [issue.field]: issue.message });
      skipNextErrorScroll();
    }
  }

  function handleFieldChange(fieldName, value) {
    clearFieldError(fieldName);
    setError("");
    setForm((prev) => ({ ...prev, [fieldName]: value }));
  }

  const mergedFormProps = {
    ...formProps,
    onInvalidCapture: handleInvalidCapture,
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[32px] bg-white p-8 shadow-sm lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">Account</p>
        <h1 className="mt-3 text-4xl font-semibold text-stone-900">Login</h1>
        <p className="mt-3 text-stone-600">Sign in to book appointments and manage your bookings.</p>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="mt-8 space-y-4"
          {...mergedFormProps}
        >
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleFieldChange("email", e.target.value)}
            className="h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 outline-none focus:border-rose-300"
            required
          />
          {fieldErrors.email ? (
            <p className="text-sm text-rose-700">{fieldErrors.email}</p>
          ) : null}
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Password"
            value={form.password}
            minLength={6}
            onChange={(e) => handleFieldChange("password", e.target.value)}
            className="h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 outline-none focus:border-rose-300"
            required
          />
          {fieldErrors.password ? (
            <p className="text-sm text-rose-700">{fieldErrors.password}</p>
          ) : null}
          <FormErrorAlert message={error} errorRef={errorRef} />
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
          <p className="mt-3 font-semibold text-stone-900">Default cashier account</p>
          <p>Email: cashier@suspa.local</p>
          <p>Password: Cashier@123</p>
        </div>
      </div>
    </div>
  );
}
