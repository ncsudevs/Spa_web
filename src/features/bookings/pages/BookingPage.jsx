import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBooking, getSlotAvailability } from "../api/bookingApi";
import Field from "../../../shared/components/Field";
import DatePicker from "../../../shared/components/DatePicker";
import FormErrorAlert from "../../../shared/components/FormErrorAlert";
import { useAuth } from "../../../context/useAuth";
import useFormErrorAssist from "../../../shared/hooks/useFormErrorAssist";
import { formatCurrency, formatDate } from "../../../shared/utils/formatters";
import {
  clearCart,
  clearSelectedBookingItems,
  getSelectedBookingItems,
  readCart,
} from "../../../shared/utils/customerStorage";

const bookingTimeOptions = [
  "09:00 AM",
  "10:30 AM",
  "12:00 PM",
  "02:00 PM",
  "03:30 PM",
  "05:00 PM",
  "06:30 PM",
];

const PHONE_MAX_LENGTH = 15;

const PHONE_REGIONS = [
  { code: "VN", label: "Vietnam (+84)" },
  { code: "US", label: "United States (+1)" },
  { code: "GB", label: "United Kingdom (+44)" },
];

function normalizePhoneInput(value) {
  return value.replace(/\D/g, "").slice(0, PHONE_MAX_LENGTH);
}

function parseTimeToMinutes(value) {
  if (!value) return null;

  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3]?.toUpperCase();

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  if (minutes < 0 || minutes > 59) return null;

  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;

  return (hours % 24) * 60 + minutes;
}

function isPastDateIso(iso) {
  if (!iso) return true;
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return true;
  const today = new Date();
  const todayMid = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
  );
  return date < todayMid;
}

function buildSelectedCart(cart, selectedServiceIds) {
  const effectiveIds = selectedServiceIds.length
    ? selectedServiceIds
    : cart.map((item) => item.service.id);

  return cart.filter((item) => effectiveIds.includes(item.service.id));
}

function buildPersonalUnits(selectedCart) {
  return selectedCart.flatMap((item) =>
    Array.from({ length: item.quantity }, (_, index) => ({
      key: `${item.service.id}-${index + 1}`,
      serviceId: item.service.id,
      serviceName:
        item.quantity > 1
          ? `${item.service.name} #${index + 1}`
          : item.service.name,
      baseServiceName: item.service.name,
      price: item.service.price,
      duration: item.service.duration,
      slotCapacity: item.service.slotCapacity || 5,
      categoryName: item.service.categoryName || item.service.category,
    })),
  );
}

function AvailabilityHint({ availability, quantity = 1 }) {
  if (!availability) return null;

  const remaining =
    availability.remainingSlots ??
    availability.available ??
    availability.slotsLeft ??
    0;

  const capacity = availability.slotCapacity ?? availability.capacity ?? 0;
  const enough = remaining >= quantity;

  return (
    <p
      className={`mt-2 text-xs ${
        enough ? "text-emerald-600" : "text-rose-600"
      }`}
    >
      {remaining} / {capacity} slots left
      {!enough ? ` - your selection needs ${quantity}` : ""}
    </p>
  );
}

function scrollElementIntoView(node, offset = 120) {
  if (!(node instanceof HTMLElement)) return false;

  const top = node.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: "smooth",
  });

  return true;
}

function focusBookingTarget(node) {
  if (!(node instanceof HTMLElement)) return false;

  const focusable =
    node.matches("input, select, textarea")
      ? node
      : node.querySelector("input, select, textarea, .flatpickr-input");

  if (!(focusable instanceof HTMLElement)) {
    return scrollElementIntoView(node);
  }

  focusable.setAttribute("aria-invalid", "true");

  try {
    focusable.focus({ preventScroll: true });
  } catch {
    focusable.focus();
  }

  return scrollElementIntoView(node);
}

function scrollToValidationIssue(formNode, issue) {
  if (!(formNode instanceof HTMLFormElement) || !issue) return false;

  if (issue.mode === "contact" && issue.field) {
    const selectors = {
      fullName: ['[data-booking-field="full-name"]'],
      phone: ['[data-booking-field="phone-number"]'],
      email: ['[data-booking-field="email-address"]'],
      note: ['[data-booking-field="note"]'],
    };

    for (const selector of selectors[issue.field] || []) {
      const target = formNode.querySelector(selector);
      if (focusBookingTarget(target)) return true;
    }
  }

  if (issue.mode === "group") {
    const selectors =
      issue.field === "time"
        ? [
            '[data-booking-field="group-time"]',
            '[data-booking-field="group-section"]',
          ]
        : issue.field === "date"
          ? [
              '[data-booking-field="group-date"]',
              '[data-booking-field="group-section"]',
            ]
          : ['[data-booking-field="group-section"]'];

    for (const selector of selectors) {
      const target = formNode.querySelector(selector);
      if (focusBookingTarget(target)) return true;
    }
  }

  if (issue.mode === "personal" && issue.key) {
    const base = `[data-booking-item="${issue.key}"]`;
    const selectors =
      issue.field === "time"
        ? [`${base} [data-booking-field="appointment-time"]`, base]
        : issue.field === "date"
          ? [`${base} [data-booking-field="appointment-date"]`, base]
          : [base];

    for (const selector of selectors) {
      const target = formNode.querySelector(selector);
      if (focusBookingTarget(target)) return true;
    }
  }

  return false;
}

function mapBookingServerError(message) {
  const normalized = String(message || "").toLowerCase();

  if (normalized.includes("phone")) {
    return { mode: "contact", field: "phone", message };
  }

  if (normalized.includes("email")) {
    return { mode: "contact", field: "email", message };
  }

  if (normalized.includes("full name") || normalized.includes("name")) {
    return { mode: "contact", field: "fullName", message };
  }

  if (normalized.includes("note")) {
    return { mode: "contact", field: "note", message };
  }

  return null;
}

export default function BookingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const formRef = useRef(null);

  const [cart] = useState(() => readCart());
  const [selectedServiceIds] = useState(() => getSelectedBookingItems());

  const selectedCart = useMemo(
    () => buildSelectedCart(cart, selectedServiceIds),
    [cart, selectedServiceIds],
  );

  const bookingUnits = useMemo(
    () => buildPersonalUnits(selectedCart),
    [selectedCart],
  );

  const [bangkokNow, setBangkokNow] = useState(() => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + 7 * 3600000);
  });

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      setBangkokNow(new Date(utc + 7 * 3600000));
    }, 60_000);

    return () => clearInterval(id);
  }, []);

  const todayIso = useMemo(
    () => bangkokNow.toISOString().split("T")[0],
    [bangkokNow],
  );

  const canUseGroupBooking =
    selectedCart.length === 1 && (selectedCart[0]?.quantity || 0) > 1;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validationIssue, setValidationIssue] = useState(null);
  const { errorRef, formProps, skipNextErrorScroll } = useFormErrorAssist(error);
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    region: "VN",
    phone: normalizePhoneInput(user?.phone || ""),
    email: user?.email || "",
    note: "",
  });

  const [bookingMode, setBookingMode] = useState("personal");

  const [appointments, setAppointments] = useState(() =>
    bookingUnits.reduce((acc, item) => {
      acc[item.key] = {
        date: "",
        displayDate: "",
        time: bookingTimeOptions[0],
      };
      return acc;
    }, {}),
  );

  const [groupSchedule, setGroupSchedule] = useState({
    date: "",
    displayDate: "",
    time: bookingTimeOptions[0],
  });

  const [availabilityMap, setAvailabilityMap] = useState({});
  const [groupAvailability, setGroupAvailability] = useState(null);

  const selectedGroupItem = useMemo(
    () => (selectedCart.length === 1 ? selectedCart[0] : null),
    [selectedCart],
  );

  const groupServiceId = selectedGroupItem?.service.id ?? null;
  const groupQuantity = selectedGroupItem?.quantity ?? 0;
  const groupDate = groupSchedule.date;
  const groupTime = groupSchedule.time;

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      fullName: user?.fullName || prev.fullName,
      region: prev.region || "VN",
      phone: normalizePhoneInput(user?.phone || prev.phone),
      email: user?.email || prev.email,
    }));
  }, [user]);

  useEffect(() => {
    if (!cart.length || !selectedCart.length) {
      navigate("/cart", { replace: true });
    }
  }, [cart.length, navigate, selectedCart.length]);

  useEffect(() => {
    if (!canUseGroupBooking && bookingMode === "group") {
      setBookingMode("personal");
    }
  }, [bookingMode, canUseGroupBooking]);

  useEffect(() => {
    setAppointments((prev) => {
      const next = bookingUnits.reduce((acc, item) => {
        acc[item.key] = prev[item.key] || {
          date: "",
          displayDate: "",
          time: bookingTimeOptions[0],
        };
        return acc;
      }, {});

      const same =
        JSON.stringify(Object.keys(prev).sort()) ===
          JSON.stringify(Object.keys(next).sort()) &&
        Object.keys(next).every(
          (key) =>
            prev[key]?.date === next[key]?.date &&
            prev[key]?.time === next[key]?.time,
        );

      return same ? prev : next;
    });
  }, [bookingUnits]);

  useEffect(() => {
    if (bookingMode !== "personal") {
      setAvailabilityMap({});
      return;
    }

    const entries = bookingUnits.filter(
      (item) => appointments[item.key]?.date && appointments[item.key]?.time,
    );

    if (!entries.length) {
      setAvailabilityMap({});
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const results = await Promise.all(
          entries.map((item) =>
            getSlotAvailability({
              serviceId: item.serviceId,
              appointmentDate: appointments[item.key].date,
              appointmentTime: appointments[item.key].time,
              quantity: 1,
            }).then((data) => [item.key, data]),
          ),
        );

        if (!cancelled) {
          setAvailabilityMap(Object.fromEntries(results));
        }
      } catch {
        if (!cancelled) {
          setAvailabilityMap({});
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [appointments, bookingMode, bookingUnits]);

  useEffect(() => {
    if (
      bookingMode !== "group" ||
      !groupServiceId ||
      !groupDate ||
      !groupTime ||
      groupQuantity <= 0
    ) {
      setGroupAvailability(null);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const data = await getSlotAvailability({
          serviceId: groupServiceId,
          appointmentDate: groupDate,
          appointmentTime: groupTime,
          quantity: groupQuantity,
        });

        if (!cancelled) {
          setGroupAvailability(data);
        }
      } catch {
        if (!cancelled) {
          setGroupAvailability(null);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [bookingMode, groupDate, groupQuantity, groupServiceId, groupTime]);

  const total = useMemo(
    () =>
      selectedCart.reduce(
        (sum, item) => sum + item.service.price * item.quantity,
        0,
      ),
    [selectedCart],
  );

  function isPastToday(time) {
    const minutes = parseTimeToMinutes(time);
    if (minutes == null) return false;
    const nowMinutes = bangkokNow.getHours() * 60 + bangkokNow.getMinutes();
    return minutes <= nowMinutes;
  }

  function pickTimeForDate(selectedDate, currentTime) {
    if (!selectedDate) return currentTime || bookingTimeOptions[0];
    if (selectedDate !== todayIso) return currentTime || bookingTimeOptions[0];
    if (currentTime && !isPastToday(currentTime)) return currentTime;
    return bookingTimeOptions.find((time) => !isPastToday(time)) || currentTime;
  }

  function updateAppointment(key, field, value) {
    setValidationIssue((current) =>
      current?.mode === "personal" && current?.key === key ? null : current,
    );
    setAppointments((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  }

  function updateAppointmentDateDisplay(key, iso) {
    setValidationIssue((current) =>
      current?.mode === "personal" && current?.key === key ? null : current,
    );
    setAppointments((prev) => {
      const current = prev[key] || {
        date: "",
        displayDate: "",
        time: bookingTimeOptions[0],
      };

      return {
        ...prev,
        [key]: {
          ...current,
          displayDate: formatDate(iso),
          date: iso,
          time: pickTimeForDate(iso, current.time),
        },
      };
    });
  }

  function updateGroupDate(iso) {
    setValidationIssue((current) =>
      current?.mode === "group" ? null : current,
    );
    setGroupSchedule((prev) => ({
      ...prev,
      displayDate: formatDate(iso),
      date: iso,
      time: pickTimeForDate(iso, prev.time),
    }));
  }

  function validatePersonalAppointments() {
    const seenSlots = new Map();

    for (const item of bookingUnits) {
      const current = appointments[item.key];

      if (!current?.date || !current?.time) {
        return {
          mode: "personal",
          key: item.key,
          field: current?.date ? "time" : "date",
          message: `Please choose appointment date and preferred time for ${item.serviceName}.`,
        };
      }

      if (isPastDateIso(current.date)) {
        return {
          mode: "personal",
          key: item.key,
          field: "date",
          message: `Appointment date for ${item.serviceName} cannot be in the past.`,
        };
      }

      if (current.date === todayIso && isPastToday(current.time)) {
        return {
          mode: "personal",
          key: item.key,
          field: "time",
          message: `Appointment time for ${item.serviceName} must be in the future.`,
        };
      }

      const slotKey = `${current.date}__${current.time}`;
      if (seenSlots.has(slotKey)) {
        return {
          mode: "personal",
          key: item.key,
          field: "section",
          message: `${item.serviceName} conflicts with ${seenSlots.get(slotKey).name} because two personal services cannot happen at the same date and time.`,
        };
      }

      const availability = availabilityMap[item.key];
      const remaining =
        availability?.remainingSlots ??
        availability?.available ??
        availability?.slotsLeft;

      if (availability && Number(remaining) < 1) {
        return {
          mode: "personal",
          key: item.key,
          field: "section",
          message: `${item.serviceName} no longer has available slots at ${current.date} ${current.time}.`,
        };
      }

      seenSlots.set(slotKey, {
        key: item.key,
        name: item.serviceName,
      });
    }

    return null;
  }

  function validateGroupBooking() {
    const selectedItem = selectedCart[0];

    if (!selectedItem) {
      return {
        mode: "general",
        message: "Please choose one service for group booking.",
      };
    }

    if (!groupSchedule.date || !groupSchedule.time) {
      return {
        mode: "group",
        field: groupSchedule.date ? "time" : "date",
        message: "Please choose the shared appointment date and time for your group.",
      };
    }

    if (isPastDateIso(groupSchedule.date)) {
      return {
        mode: "group",
        field: "date",
        message: "Group booking date cannot be in the past.",
      };
    }

    if (groupSchedule.date === todayIso && isPastToday(groupSchedule.time)) {
      return {
        mode: "group",
        field: "time",
        message: "Group booking time must be in the future.",
      };
    }

    if (!groupAvailability) {
      return {
        mode: "group",
        field: "section",
        message: "Please wait a moment for slot availability to load.",
      };
    }

    const remaining =
      groupAvailability.remainingSlots ??
      groupAvailability.available ??
      groupAvailability.slotsLeft ??
      0;

    if (remaining < selectedItem.quantity) {
      return {
        mode: "group",
        field: "section",
        message: `Only ${remaining} slot(s) left for that time.`,
      };
    }

    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setValidationIssue(null);

    const nextValidationIssue =
      bookingMode === "group"
        ? validateGroupBooking()
        : validatePersonalAppointments();

    if (nextValidationIssue) {
      setValidationIssue(nextValidationIssue);
      const focusedErrorField = scrollToValidationIssue(
        formRef.current,
        nextValidationIssue,
      );
      if (focusedErrorField) {
        skipNextErrorScroll();
      }

      if (nextValidationIssue.mode === "general") {
        setError(nextValidationIssue.message);
      }

      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        fullName: form.fullName.trim(),
        phone: normalizePhoneInput(form.phone),
        region: form.region,
        email: form.email.trim(),
        note: form.note.trim() || null,
        isGroupBooking: bookingMode === "group",
        groupSize: bookingMode === "group" ? selectedCart[0].quantity : 1,
        items:
          bookingMode === "group"
            ? [
                {
                  serviceId: selectedCart[0].service.id,
                  quantity: selectedCart[0].quantity,
                  appointmentDate: groupSchedule.date,
                  appointmentTime: groupSchedule.time,
                },
              ]
            : bookingUnits.map((item) => ({
                serviceId: item.serviceId,
                quantity: 1,
                appointmentDate: appointments[item.key].date,
                appointmentTime: appointments[item.key].time,
              })),
      };

      const booking = await createBooking(payload);
      clearCart();
      clearSelectedBookingItems();
      navigate("/my-bookings", {
        state: {
          bookingCreated: true,
          bookingCode: booking.bookingCode,
        },
      });
    } catch (err) {
      const message = err.message || "Cannot create booking.";
      const serverIssue = mapBookingServerError(message);

      if (serverIssue) {
        setValidationIssue(serverIssue);
        const focusedErrorField = scrollToValidationIssue(
          formRef.current,
          serverIssue,
        );
        if (focusedErrorField) {
          skipNextErrorScroll();
        }
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <section className="rounded-[32px] bg-white p-8 shadow-sm lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">
            Booking
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-stone-900">
            Complete your appointment details
          </h1>

          <FormErrorAlert message={error} errorRef={errorRef} className="mt-6" />

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="mt-8 space-y-8"
            {...formProps}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Full name">
                <input
                  required
                  name="fullName"
                  autoComplete="name"
                  data-booking-field="full-name"
                  className="field"
                  value={form.fullName}
                  onChange={(e) => {
                    setValidationIssue((current) =>
                      current?.mode === "contact" &&
                      current?.field === "fullName"
                        ? null
                        : current,
                    );
                    setForm({ ...form, fullName: e.target.value });
                  }}
                />
                {validationIssue?.mode === "contact" &&
                validationIssue?.field === "fullName" ? (
                  <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {validationIssue.message}
                  </div>
                ) : null}
              </Field>

              <Field label="Phone number">
                <div className="flex flex-col gap-3">
                  <select
                    name="region"
                    className="field"
                    value={form.region}
                    onChange={(e) => {
                      setValidationIssue((current) =>
                        current?.mode === "contact" &&
                        current?.field === "phone"
                          ? null
                          : current,
                      );
                      setForm({ ...form, region: e.target.value });
                    }}
                  >
                    {PHONE_REGIONS.map((region) => (
                      <option key={region.code} value={region.code}>
                        {region.label}
                      </option>
                    ))}
                  </select>

                  <input
                    required
                    name="phone"
                    data-booking-field="phone-number"
                    type="text"
                    inputMode="numeric"
                    autoComplete="tel"
                    className="field"
                    value={form.phone}
                    maxLength={PHONE_MAX_LENGTH}
                    onChange={(e) => {
                      setValidationIssue((current) =>
                        current?.mode === "contact" &&
                        current?.field === "phone"
                          ? null
                          : current,
                      );
                      setForm({
                        ...form,
                        phone: normalizePhoneInput(e.target.value),
                      });
                    }}
                  />
                </div>
                {validationIssue?.mode === "contact" &&
                validationIssue?.field === "phone" ? (
                  <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {validationIssue.message}
                  </div>
                ) : null}
              </Field>

              <Field label="Email address">
                <input
                  required
                  name="email"
                  type="email"
                  data-booking-field="email-address"
                  className="field bg-stone-100"
                  value={form.email}
                  readOnly
                />
                {validationIssue?.mode === "contact" &&
                validationIssue?.field === "email" ? (
                  <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {validationIssue.message}
                  </div>
                ) : null}
              </Field>

              <Field label="Note">
                <textarea
                  name="note"
                  data-booking-field="note"
                  rows="4"
                  className="field"
                  value={form.note}
                  onChange={(e) => {
                    setValidationIssue((current) =>
                      current?.mode === "contact" &&
                      current?.field === "note"
                        ? null
                        : current,
                    );
                    setForm({ ...form, note: e.target.value });
                  }}
                />
                {validationIssue?.mode === "contact" &&
                validationIssue?.field === "note" ? (
                  <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {validationIssue.message}
                  </div>
                ) : null}
              </Field>
            </div>

            <div className="rounded-[28px] border border-stone-200 bg-stone-50 p-5">
              <p className="text-sm font-semibold text-stone-900">
                Booking mode
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setValidationIssue(null);
                    setBookingMode("personal");
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    bookingMode === "personal"
                      ? "bg-stone-950 text-white"
                      : "bg-white text-stone-600"
                  }`}
                >
                  Personal booking
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!canUseGroupBooking) return;
                    setValidationIssue(null);
                    setBookingMode("group");
                  }}
                  disabled={!canUseGroupBooking}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    bookingMode === "group"
                      ? "bg-stone-950 text-white"
                      : "bg-white text-stone-600"
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  Booking for group
                </button>
              </div>

              <p className="mt-3 text-sm text-stone-500">
                Group booking lets everyone share the same date and time. It is
                available when you book one service for more than one person.
              </p>
            </div>

            {bookingMode === "group" ? (
              <div className="space-y-4">
                <div
                  data-booking-field="group-section"
                  className="rounded-[28px] border border-stone-200 bg-stone-50/70 p-5"
                >
                  <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-stone-900">
                        {selectedCart[0]?.service.name}
                      </h3>
                      <p className="text-sm text-stone-500">
                        Group size: {selectedCart[0]?.quantity} people - Capacity
                        per slot: {selectedCart[0]?.service.slotCapacity || 5}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-rose-500">
                      {formatCurrency(selectedCart[0]?.service.price)} each
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Shared appointment date">
                      <div data-booking-field="group-date">
                        <DatePicker
                          value={groupSchedule.date}
                          onChange={updateGroupDate}
                          minDate={todayIso}
                          maxDate={null}
                        />
                      </div>
                    </Field>

                    <Field label="Shared preferred time">
                      <select
                        data-booking-field="group-time"
                        name="groupTime"
                        className="field"
                        value={groupSchedule.time}
                        onChange={(e) => {
                          setValidationIssue((current) =>
                            current?.mode === "group" ? null : current,
                          );
                          setGroupSchedule((prev) => ({
                            ...prev,
                            time: e.target.value,
                          }));
                        }}
                      >
                        {bookingTimeOptions.map((time) => {
                          const disable =
                            groupSchedule.date === todayIso && isPastToday(time);

                          return (
                            <option key={time} value={time} disabled={disable}>
                              {time} {disable ? "(Closed)" : ""}
                            </option>
                          );
                        })}
                      </select>
                    </Field>
                  </div>

                  {validationIssue?.mode === "group" ? (
                    <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {validationIssue.message}
                    </div>
                  ) : null}

                  <AvailabilityHint
                    availability={groupAvailability}
                    quantity={selectedCart[0]?.quantity || 1}
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-stone-900">
                    Schedule each service
                  </h2>
                </div>

                <div className="space-y-4">
                  {bookingUnits.map((item) => (
                    <div
                      key={item.key}
                      data-booking-field="appointment-section"
                      data-booking-item={item.key}
                      className="rounded-[28px] border border-stone-200 bg-stone-50/70 p-5"
                    >
                      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-stone-900">
                            {item.serviceName}
                          </h3>
                          <p className="text-sm text-stone-500">
                            {item.duration} min - {item.categoryName} - Capacity
                            per slot: {item.slotCapacity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-rose-500">
                          {formatCurrency(item.price)}
                        </p>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <Field label={`Appointment date - ${item.baseServiceName}`}>
                          <div data-booking-field="appointment-date">
                            <DatePicker
                              value={appointments[item.key]?.date}
                              onChange={(iso) =>
                                updateAppointmentDateDisplay(item.key, iso)
                              }
                              minDate={todayIso}
                              maxDate={null}
                            />
                          </div>
                        </Field>

                        <Field label={`Preferred time - ${item.baseServiceName}`}>
                          <select
                            data-booking-field="appointment-time"
                            name={`time-${item.key}`}
                            className="field"
                            value={
                              appointments[item.key]?.time ||
                              bookingTimeOptions[0]
                            }
                            onChange={(e) =>
                              updateAppointment(
                                item.key,
                                "time",
                                e.target.value,
                              )
                            }
                          >
                            {bookingTimeOptions.map((time) => {
                              const disable =
                                appointments[item.key]?.date === todayIso &&
                                isPastToday(time);

                              return (
                                <option
                                  key={time}
                                  value={time}
                                  disabled={disable}
                                >
                                  {time} {disable ? "(Closed)" : ""}
                                </option>
                              );
                            })}
                          </select>
                        </Field>
                      </div>

                      {validationIssue?.mode === "personal" &&
                      validationIssue?.key === item.key ? (
                        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                          {validationIssue.message}
                        </div>
                      ) : null}

                      <AvailabilityHint
                        availability={availabilityMap[item.key]}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-full bg-stone-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Creating booking..." : "Continue to payment"}
              </button>
            </div>
          </form>
        </section>

        <aside className="h-fit rounded-[32px] bg-stone-950 p-8 text-white shadow-sm">
          <h2 className="text-2xl font-semibold">Booking summary</h2>

          <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-300">
            Mode:{" "}
            <span className="font-semibold text-white">
              {bookingMode === "group" ? "Group booking" : "Personal booking"}
            </span>
          </div>

          <div className="mt-6 space-y-4 text-sm text-stone-300">
            {(bookingMode === "group" ? selectedCart : bookingUnits).map(
              (item) => {
                const key = item.key || item.service.id;
                const date =
                  bookingMode === "group"
                    ? groupSchedule.displayDate || groupSchedule.date
                    : appointments[key]?.displayDate || appointments[key]?.date;
                const time =
                  bookingMode === "group"
                    ? groupSchedule.time
                    : appointments[key]?.time;
                const quantity = bookingMode === "group" ? item.quantity : 1;
                const price =
                  bookingMode === "group" ? item.service.price : item.price;
                const name =
                  bookingMode === "group"
                    ? item.service.name
                    : item.serviceName;
                const duration =
                  bookingMode === "group"
                    ? item.service.duration
                    : item.duration;

                return (
                  <div key={key} className="rounded-3xl bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">{name}</p>
                        <p className="mt-1 text-xs text-stone-400">
                          {duration} min - {quantity} x {formatCurrency(price)}
                        </p>
                        <p className="mt-2 text-xs text-stone-400">
                          {date || "Select date"} - {time || "Select time"}
                        </p>
                      </div>
                      <span className="font-semibold text-white">
                        {formatCurrency(price * quantity)}
                      </span>
                    </div>
                  </div>
                );
              },
            )}
          </div>

          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="flex items-center justify-between text-xl font-semibold text-white">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
