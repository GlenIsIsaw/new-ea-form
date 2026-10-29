import { Toast, ToastContainer } from "react-bootstrap";

// Edit the wording here.
const COPY = {
  FILLING: {
    title: "Slots are filling up quickly",
    body: () =>
      "Slots are filling out quickly and will run out soon. Please submit your application as early as you can.",
  },
  FULL: {
    title: "Slots for this batch are full",
    body: (from) =>
      `Slots for this batch are now full. Applications submitted from ${
        from || "now on"
      } will be placed under waitlist or subject to the next batch. Thank you for understanding.`,
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
const AlertIcon = () => (
  <svg {...icon}>
    <path d="M12 3l10 18H2z" />
    <path d="M12 10v5M12 18h.01" />
  </svg>
);

// A controlled pop-up: App.jsx decides WHEN to show it (once when the page opens, for 7 seconds).
// Only one kind is ever shown at a time ("FILLING" or "FULL").
export default function SlotToast({ show, kind, from, onClose }) {
  const copy = COPY[kind];
  if (!copy) return null;
  const tone = kind === "FULL" ? "full" : "filling";
  const Icon = kind === "FULL" ? AlertIcon : ClockIcon;

  return (
    <ToastContainer className="slot-toast-container" containerPosition="fixed">
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
            <div className="slot-toast-body">{copy.body(from)}</div>
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
        <div className={`slot-toast-bar ${tone}`} key={`${kind}-${show}`} />
      </Toast>
    </ToastContainer>
  );
}
