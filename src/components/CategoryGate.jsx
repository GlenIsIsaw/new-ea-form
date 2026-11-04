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
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className="bi bi-people-fill"
        viewBox="0 0 16 16"
      >
        <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
      </svg>
    ),
  },
  {
    key: "COLLEGE",
    title: "College Students",
    text: "Choose this if you are currently enrolled in college.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className="bi bi-person-fill"
        viewBox="0 0 16 16"
      >
        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
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
