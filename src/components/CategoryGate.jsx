// First screen. The form stays hidden until the applicant chooses a category.
export const CATEGORY_LABELS = {
  AUTHORIZATION: "Authorization / Minor Age / Senior High School",
  COLLEGE: "College Students",
};

const OPTIONS = [
  {
    key: "AUTHORIZATION",
    title: "Authorization / Minor Age / Senior High School",
    text: "Choose this if you are applying through an authorization, you are a minor, or you are a Senior High School student.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    key: "COLLEGE",
    title: "College Students",
    text: "Choose this if you are currently enrolled in college.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 9l10-5 10 5-10 5z" />
        <path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
        <path d="M22 9v6" />
      </svg>
    ),
  },
];

export default function CategoryGate({ onSelect }) {
  return (
    <div className="form-wrapper">
      <div className="form-header">
        <h1>Educational Assistance 2026</h1>
        <p>Choose the option that describes you to continue</p>
      </div>

      <div className="form-body">
        <div className="section-title">Select Your Category</div>
        <div className="gate-grid" role="group" aria-label="Applicant category">
          {OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              className="gate-card"
              onClick={() => onSelect(o.key)}
            >
              <span className="gate-icon">{o.icon}</span>
              <span className="gate-title">{o.title}</span>
              <span className="gate-text">{o.text}</span>
              <span className="gate-go">Continue &rarr;</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
