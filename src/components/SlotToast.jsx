import { Toast, ToastContainer } from "react-bootstrap";

export const NOTICE_MS = 7000; // first two pop-ups: how long they stay
export const CLOSING_SHOW_MS = 10000; // closing pop-up: how long it stays
export const CLOSING_GAP_MS = 8000; // closing pop-up: pause before it pops up again

// Edit the wording here.
const COPY = {
  FILLING: {
    title: "Slots are filling out quickly",
    body: () =>
      "Slots are filling out quickly and will run out soon. Please submit your application as early as you can.",
  },
  FULL: {
    title: "Slots for this batch are full",
    body: ({ from }) =>
      `Slots for this batch are now full. Applications submitted from ${
        from || "now on"
      } will be placed under WAITLIST or subject to the NEXT BATCH. Thank you for understanding.`,
  },
  AVAILABLE: {
    title: "Slots are available",
    body: () =>
      "Slots are still available for this batch. Please submit your application early.",
  },
  CLOSING: {
    title: "Application closing soon",
    body: ({ closesText, remaining }) =>
      `Application closes on ${closesText}. Please submit your application now. Time remaining is ${remaining}.`,
  },
  TRAFFIC: {
    title: "Heavy traffic notice",
    body: () =>
      "Some users may experience temporary errors due to high website traffic. We kindly ask for your patience and understanding. Please try again after a few minutes.",
  },
};

const icon = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};
const ClockIcon = () => (
  <svg {...icon}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
const HourglassIcon = () => (
  <svg {...icon}>
    <path d="M6 3h12M6 21h12" />
    <path d="M7 3v3a5 5 0 0 0 2 4l3 2-3 2a5 5 0 0 0-2 4v3M17 3v3a5 5 0 0 1-2 4l-3 2 3 2a5 5 0 0 1 2 4v3" />
  </svg>
);
const CheckIcon = () => (
  <svg {...icon}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l3 3 5-6" />
  </svg>
);
const AlertIcon = () => (
  <svg {...icon}>
    <path d="M12 3l10 18H2z" />
    <path d="M12 10v5M12 18h.01" />
  </svg>
);

// A controlled pop-up: App.jsx decides WHEN to show it (once when the page opens, for 7 seconds).
// Only one kind is ever shown at a time ("FILLING" or "FULL").
export default function SlotToast({
  show,
  kind,
  from,
  closesText,
  remaining,
  seconds = 7,
  onClose,
  below = false,
}) {
  const copy = COPY[kind];
  if (!copy) return null;
  const tone =
    {
      FULL: "full",
      CLOSING: "closing",
      AVAILABLE: "available",
      TRAFFIC: "traffic",
    }[kind] || "filling";
  const Icon =
    {
      FULL: AlertIcon,
      AVAILABLE: CheckIcon,
      CLOSING: HourglassIcon,
      TRAFFIC: AlertIcon,
    }[kind] || ClockIcon;

  return (
    <ToastContainer
      className={`slot-toast-container${below ? " below" : ""}`}
      containerPosition="fixed"
    >
      <Toast
        show={show}
        onClose={onClose}
        animation
        className={`slot-toast ${tone}`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="slot-toast-inner">
          <span className={`slot-toast-icon ${tone}`}>
            <Icon />
          </span>
          <div className="slot-toast-text">
            <div className="slot-toast-title">{copy.title}</div>
            <div className="slot-toast-body">
              {copy.body({ from, closesText, remaining })}
            </div>
          </div>
          <button
            type="button"
            className="slot-toast-close"
            onClick={onClose}
            aria-label="Close notice"
          >
            &times;
          </button>
        </div>
        {/* thin bar that shrinks over the 7 seconds the notice stays */}
        <div
          className={`slot-toast-bar ${tone}`}
          key={`${kind}-${show}`}
          style={{ animationDuration: `${seconds}s` }}
        />
      </Toast>
    </ToastContainer>
  );
}
