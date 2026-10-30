import { useCallback, useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Asks the Apps Script web app (?action=status) whether the site is open.
//   null          = still checking
//   "OPEN"        = show the form
//   "CLOSED"      = show the "Application Closed" page
//   "MAINTENANCE" = show the maintenance page
//   "ERROR"       = could not reach the server (never treated as open)
// Anything the server sends that is not exactly one of the three states becomes "ERROR".
// NOTE: this only controls what the visitor SEES. The script itself refuses submissions when the
// site is closed, so hiding or editing this page in the browser cannot bypass the switch.
// ---------------------------------------------------------------------------
const VALID = ["OPEN", "CLOSED", "MAINTENANCE"];
const POLL_MS = 60000; // re-check every 60 s while the page is open
const RETRY_MS = 15000; // re-check faster after an error

export function useSiteStatus(apiUrl) {
  const [status, setStatus] = useState(null);
  const [notice, setNotice] = useState("NONE"); // "NONE" | "FILLING" | "FULL" = which slot pop-up to show
  const [noticeFrom, setNoticeFrom] = useState(""); // date/time text shown in the "slots full" pop-up

  const [closing, setClosing] = useState("OFF");
  const [closesAtMs, setClosesAtMs] = useState(0);
  const [closesText, setClosesText] = useState("");
  const [clockOffset, setClockOffset] = useState(0);

  const check = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}?action=status&t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (VALID.includes(data.state)) {
        setStatus(data.state);
        setNotice(
          data.notice === "FILLING" || data.notice === "FULL"
            ? data.notice
            : "NONE",
        );
        setNoticeFrom(
          typeof data.from === "string" ? data.from.slice(0, 80) : "",
        );
        setClosing(data.closing === "ON" ? "ON" : "OFF");
        setClosesAtMs(
          Number(data.closesAtMs) > 0 ? Number(data.closesAtMs) : 0,
        );
        setClosesText(
          typeof data.closesText === "string"
            ? data.closesText.slice(0, 80)
            : "",
        );
        if (Number(data.serverNow) > 0)
          setClockOffset(Number(data.serverNow) - Date.now());
      } else {
        setStatus("ERROR");
      }
    } catch {
      // a failed re-check keeps the last known state; only the very first check (or a previous error) shows ERROR
      setStatus((prev) => (prev === null || prev === "ERROR" ? "ERROR" : prev));
    }
  }, [apiUrl]);

  useEffect(() => {
    check();
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [check]);

  useEffect(() => {
    const id = setInterval(
      () => {
        if (document.visibilityState === "visible") check();
      },
      status === "ERROR" ? RETRY_MS : POLL_MS,
    );
    return () => clearInterval(id);
  }, [check, status]);

   return { status, setStatus, check, notice, noticeFrom, closing, closesAtMs, closesText, clockOffset };
}

// ---------------------------------------------------------------------------
// Full-screen pages. They are returned INSTEAD of the app, so there is no form underneath to reveal.
// ---------------------------------------------------------------------------
const icon = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

const WrenchIcon = () => (
  <svg {...icon}>
    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.1L3.5 17.2a1.8 1.8 0 0 0 2.6 2.6l5.8-5.8a4 4 0 0 0 5.1-5.4l-2.4 2.4-2.1-.5-.5-2.1z" />
  </svg>
);
const LockIcon = () => (
  <svg {...icon}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);
const WifiOffIcon = () => (
  <svg {...icon}>
    <path d="M2 8.8a15 15 0 0 1 4-2.4M22 8.8a15 15 0 0 0-9-3.7M5 12.9a10 10 0 0 1 3.5-2M19 12.9a10 10 0 0 0-4.3-2.3M8.5 16.4a5 5 0 0 1 7 0" />
    <path d="M12 20h.01M3 3l18 18" />
  </svg>
);

function StatusCard({
  tone,
  icon: Icon,
  title,
  message,
  sub,
  onRetry,
  retryText = "Check again",
  role,
}) {
  return (
    <div className="status-overlay" role={role} aria-live="polite">
      <div className="status-card">
        <div className={`status-icon ${tone}`}>
          <Icon />
        </div>
        <h2 className="status-title">{title}</h2>
        <p className="status-message">{message}</p>
        {sub && <p className="status-sub">{sub}</p>}
        {onRetry && (
          <button type="button" className="status-btn" onClick={onRetry}>
            {retryText}
          </button>
        )}
        <div className="status-divider" />
        <p className="status-foot">Educational Assistance 2026</p>
      </div>
    </div>
  );
}

export function StatusLoading() {
  return (
    <div className="status-overlay" role="status" aria-live="polite">
      <div className="status-card">
        <div className="spinner-border mb-3" style={{ color: "#1a5c38" }} />
        <h2 className="status-title">The application is loading</h2>
        <p className="status-sub">Please wait a moment.</p>
      </div>
    </div>
  );
}

export const MaintenancePage = ({ onRetry }) => (
  <StatusCard
    role="alert"
    tone="maintenance"
    icon={WrenchIcon}
    title="System Under Maintenance"
    message="We are making improvements to the system. Please check back in a little while."
    sub="You don't need to do anything. This page checks on its own, and the form will appear as soon as we are back."
    onRetry={onRetry}
  />
);

export const ClosedPage = ({ onRetry }) => (
  <StatusCard
    role="alert"
    tone="closed"
    icon={LockIcon}
    title="Application Closed"
    message="We are no longer accepting applications at this time."
    sub="Thank you for your interest. Please watch for official announcements about the next schedule."
    onRetry={onRetry}
    retryText="Refresh"
  />
);

export const StatusError = ({ onRetry }) => (
  <StatusCard
    role="alert"
    tone="error"
    icon={WifiOffIcon}
    title="Can't Reach the Server"
    message="We could not check the system status. Please check your internet connection."
    sub="We will try again automatically."
    onRetry={onRetry}
    retryText="Try again"
  />
);
