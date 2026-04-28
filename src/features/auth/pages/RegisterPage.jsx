import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormErrorAlert from "../../../shared/components/FormErrorAlert";
import { useAuth } from "../../../context/AuthContext";
import useFormErrorAssist, {
  focusAndScrollField,
} from "../../../shared/hooks/useFormErrorAssist";
import {
  getApiFieldIssues,
  getAuthFieldIssueFromMessage,
  getAuthGeneralErrorMessage,
  getNativeFieldIssue,
} from "../../../shared/utils/formErrorMessages";

const PHONE_MAX_LENGTH = 15;
const PHONE_REGIONS = [
  { code: "VN", label: "Vietnam (+84)" },
  { code: "US", label: "United States (+1)" },
  { code: "GB", label: "United Kingdom (+44)" },
];

function normalizePhoneInput(value) {
  return value.replace(/\D/g, "").slice(0, PHONE_MAX_LENGTH);
}

const FIELD_LABELS = {
  fullName: "full name",
  email: "email address",
  phone: "phone number",
  region: "region",
  password: "password",
  confirmPassword: "confirm password",
};

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

    const customIssue = validateRegisterForm();
    if (customIssue) {
      setError("");
      setFieldErrors({ [customIssue.field]: customIssue.message });
      const target = e.currentTarget.querySelector(
        `[name="${customIssue.field}"]`,
      );
      focusAndScrollField(target);
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setFieldErrors({});

      await register({
        ...form,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: normalizePhoneInput(form.phone),
        region: form.region,
      });

      navigate("/", { replace: true });
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

      setError(
        getAuthGeneralErrorMessage(err, "We could not create your account. Please try again."),
      );
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

  function validateRegisterForm() {
    if (!form.phone.trim()) {
      return {
        field: "phone",
        message: "Please enter your phone number.",
      };
    }

    if (form.password.length < 6) {
      return {
        field: "password",
        message: "Password must be at least 6 characters.",
      };
    }

    if (!form.confirmPassword.trim()) {
      return {
        field: "confirmPassword",
        message: "Please enter your confirm password.",
      };
    }

    if (form.confirmPassword !== form.password) {
      return {
        field: "confirmPassword",
        message: "Confirm password must match your password.",
      };
    }

    return null;
  }

  const mergedFormProps = {
    ...formProps,
    onInvalidCapture: handleInvalidCapture,
  };

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

        <form
          noValidate
          onSubmit={handleSubmit}
          className="mt-8 space-y-4"
          {...mergedFormProps}
        >
          <input
            type="text"
            name="fullName"
            autoComplete="name"
            placeholder="Full name"
            value={form.fullName}
            onChange={(e) => handleFieldChange("fullName", e.target.value)}
            className="h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 outline-none focus:border-rose-300"
            required
          />
          {fieldErrors.fullName ? (
            <p className="text-sm text-rose-700">{fieldErrors.fullName}</p>
          ) : null}

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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[170px_1fr]">
            <select
              name="region"
              value={form.region}
              onChange={(e) => handleFieldChange("region", e.target.value)}
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
              name="phone"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="Phone number"
              value={form.phone}
              onChange={(e) =>
                handleFieldChange("phone", normalizePhoneInput(e.target.value))
              }
              className="h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 outline-none focus:border-rose-300"
              maxLength={PHONE_MAX_LENGTH}
              required
            />
          </div>
          {fieldErrors.region || fieldErrors.phone ? (
            <p className="text-sm text-rose-700">
              {fieldErrors.phone || fieldErrors.region}
            </p>
          ) : null}

          <input
            type="password"
            name="password"
            autoComplete="new-password"
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

          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={(e) =>
              handleFieldChange("confirmPassword", e.target.value)
            }
            className="h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 outline-none focus:border-rose-300"
            required
          />
          {fieldErrors.confirmPassword ? (
            <p className="text-sm text-rose-700">
              {fieldErrors.confirmPassword}
            </p>
          ) : null}

          <FormErrorAlert message={error} errorRef={errorRef} />

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
