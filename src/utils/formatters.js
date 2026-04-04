const TZ = "Asia/Bangkok";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: TZ,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: TZ,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function toDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function formatDate(value) {
  if (!value) return "-";

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }

  const date = toDate(value);
  if (!date) return value;
  return dateFormatter.format(date);
}

export function formatDateTime(value) {
  if (!value) return "-";
  const date = toDate(value);
  if (!date) return value;
  return dateTimeFormatter.format(date);
}

export function formatCurrency(value) {
  const amount = Number(value || 0);
  return `${amount.toLocaleString("vi-VN", { maximumFractionDigits: 0 })} Đ`;
}
