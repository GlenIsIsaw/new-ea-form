const icon = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

const LOOK = {
  NONE: {
    tone: "available",
    label: "Slots available",
    svg: (
      <svg {...icon}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12.5l3 3 5-6" />
      </svg>
    ),
  },
  FILLING: {
    tone: "filling",
    label: "Slots filling",
    svg: (
      <svg {...icon}>
        <path d="M6 3h12M6 21h12" />
        <path d="M7 3v3a5 5 0 0 0 2 4l3 2-3 2a5 5 0 0 0-2 4v3M17 3v3a5 5 0 0 1-2 4l-3 2 3 2a5 5 0 0 1 2 4v3" />
      </svg>
    ),
  },
  CLOSING: {
    tone: "closing",
    label: "Closing soon",
    svg: (
      <svg {...icon}>
        <path d="M6 3h12M6 21h12" />
        <path d="M7 3v3a5 5 0 0 0 2 4l3 2-3 2a5 5 0 0 0-2 4v3M17 3v3a5 5 0 0 1-2 4l-3 2 3 2a5 5 0 0 1 2 4v3" />
      </svg>
    ),
  },
  FULL: {
    tone: "full",
    label: "Slots full",
    svg: (
      <svg {...icon}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9l6 6M15 9l-6 6" />
      </svg>
    ),
  },
};

export default function SlotFab({ kind, onClick, stacked = false }) {
  const look = LOOK[kind] || LOOK.NONE;
  return (
    <button
      type="button"
      className={`slot-fab ${look.tone}${stacked ? " stacked" : ""}`}
      aria-label={`${look.label}. Tap for details.`}
      title={look.label}
    >
      <span className="slot-fab-icon">{look.svg}</span>
      <span className="slot-fab-label">{look.label}</span>
    </button>
  );
}
