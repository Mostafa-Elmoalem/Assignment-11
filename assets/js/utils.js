export function formatDate(dateString, month = "long") {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month,
    day: "numeric",
  });
}

export function formatLaunchDate(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return { date: "N/A", time: "N/A" };
  }

  return {
    date: date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    time: `${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    })} UTC`,
  };
}

export function todayISO() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000)
    .toISOString()
    .split("T")[0];
}

export function isValidDate(dateString) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString) && !Number.isNaN(new Date(`${dateString}T00:00:00`).getTime());
}

export function escapeHTML(value) {
  return String(value ?? "N/A").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character]);
}

export function safeURL(value, fallback = "") {
  try {
    const url = new URL(value, window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : fallback;
  } catch {
    return fallback;
  }
}

export function numberOrNA(value, digits = 2) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(digits)
    : "N/A";
}
