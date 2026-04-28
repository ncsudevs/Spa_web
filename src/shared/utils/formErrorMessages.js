const DEFAULT_LABELS = {
  fullName: "full name",
  email: "email address",
  phone: "phone number",
  region: "region",
  password: "password",
  confirmPassword: "confirm password",
  note: "note",
};

function getFieldLabel(fieldName, fieldLabels = {}) {
  return fieldLabels[fieldName] || DEFAULT_LABELS[fieldName] || fieldName;
}

function capitalize(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getEnterVerb(element, fieldName) {
  if (element?.tagName === "SELECT" || fieldName === "region") {
    return "choose";
  }

  return "enter";
}

export function getNativeFieldIssue(element, fieldLabels = {}) {
  if (!(element instanceof HTMLElement)) return null;

  const fieldName = element.getAttribute("name");
  if (!fieldName) return null;

  const label = getFieldLabel(fieldName, fieldLabels);
  const validity = element.validity;

  if (!validity) {
    return {
      field: fieldName,
      message: `Please check your ${label}.`,
    };
  }

  if (validity.valueMissing) {
    return {
      field: fieldName,
      message: `Please ${getEnterVerb(element, fieldName)} your ${label}.`,
    };
  }

  if (validity.typeMismatch && element.getAttribute("type") === "email") {
    return {
      field: fieldName,
      message: "Please enter a valid email address.",
    };
  }

  if (validity.tooShort) {
    return {
      field: fieldName,
      message: `${capitalize(label)} must be at least ${element.minLength} characters.`,
    };
  }

  if (validity.patternMismatch) {
    return {
      field: fieldName,
      message: `Please enter a valid ${label}.`,
    };
  }

  return {
    field: fieldName,
    message: `Please check your ${label}.`,
  };
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function getFriendlyFieldMessage(fieldName, rawMessage, fieldLabels = {}) {
  const normalized = String(rawMessage || "").toLowerCase();
  const label = getFieldLabel(fieldName, fieldLabels);

  if (
    normalized.includes("required") ||
    normalized.includes("must not be empty")
  ) {
    return `Please ${fieldName === "region" ? "choose" : "enter"} your ${label}.`;
  }

  if (fieldName === "email") {
    return "Please enter a valid email address.";
  }

  if (fieldName === "password" && normalized.includes("minimum length")) {
    return "Password must be at least 6 characters.";
  }

  if (
    fieldName === "confirmPassword" &&
    (normalized.includes("do not match") || normalized.includes("compare"))
  ) {
    return "Confirm password must match your password.";
  }

  if (fieldName === "phone") {
    return "Please enter a valid phone number.";
  }

  return capitalize(String(rawMessage || `Please check your ${label}.`));
}

export function getApiFieldIssues(error, fieldLabels = {}) {
  const errors = error?.payload?.errors;
  if (!errors || typeof errors !== "object") return {};

  return Object.fromEntries(
    Object.entries(errors)
      .map(([fieldName, messages]) => {
        const firstMessage = toArray(messages)[0];
        if (!firstMessage) return null;
        const normalizedField =
          fieldName.charAt(0).toLowerCase() + fieldName.slice(1);

        return [
          normalizedField,
          getFriendlyFieldMessage(normalizedField, firstMessage, fieldLabels),
        ];
      })
      .filter(Boolean),
  );
}

export function getAuthGeneralErrorMessage(error, fallbackMessage) {
  const normalized = String(error?.message || "").toLowerCase();

  if (
    normalized.includes("invalid") &&
    (normalized.includes("email") || normalized.includes("password"))
  ) {
    return "Email or password is not correct.";
  }

  if (normalized.includes("already exists") || normalized.includes("taken")) {
    return "This email is already in use. Please try another one.";
  }

  if (normalized.includes("network") || normalized.includes("failed to fetch")) {
    return "We could not reach the server right now. Please try again.";
  }

  return fallbackMessage;
}

export function getAuthFieldIssueFromMessage(error, fieldLabels = {}) {
  const message = String(error?.message || "");
  const normalized = message.toLowerCase();

  if (normalized.includes("email is already registered")) {
    return {
      field: "email",
      message: "This email is already in use. Please try another one.",
    };
  }

  if (normalized.includes("phone number is already registered")) {
    return {
      field: "phone",
      message: "This phone number is already in use. Please try another one.",
    };
  }

  if (normalized.includes("confirm password") || normalized.includes("do not match")) {
    return {
      field: "confirmPassword",
      message: "Confirm password must match your password.",
    };
  }

  if (normalized.includes("phone")) {
    return {
      field: "phone",
      message: "Please enter a valid phone number.",
    };
  }

  if (normalized.includes("email")) {
    return {
      field: "email",
      message: "Please enter a valid email address.",
    };
  }

  if (normalized.includes("password")) {
    return {
      field: "password",
      message: getFriendlyFieldMessage("password", message, fieldLabels),
    };
  }

  return null;
}
