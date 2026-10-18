import { useState } from "react";
import "./Tracker.css";

function Tracker() {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [requestStatus, setRequestStatus] = useState(null);
  const [error, setError] = useState("");

  const sampleRequests = {
    PSR2026001: {
      service: "Business Permit",
      status: "In Progress",
      message:
        "Your request is being reviewed by the relevant department.",
      date: "12 October 2026",
    },
    PSR2026002: {
      service: "Birth Certificate",
      status: "Approved",
      message: "Your request has been approved.",
      date: "14 October 2026",
    },
    PSR2026003: {
      service: "Public Complaint",
      status: "Submitted",
      message: "Your request has been received and is awaiting review.",
      date: "16 October 2026",
    },
  };

  const handleTrackRequest = (event) => {
    event.preventDefault();

    const reference = referenceNumber.trim().toUpperCase();

    if (!reference) {
      setError("Please enter your request reference number.");
      setRequestStatus(null);
      return;
    }

    const request = sampleRequests[reference];

    if (request) {
      setRequestStatus({
        reference,
        ...request,
      });
      setError("");
    } else {
      setRequestStatus(null);
      setError(
        "No demonstration request was found. Check the reference number or try one of the examples below."
      );
    }
  };

  const progressSteps = [
    {
      title: "Request Submitted",
      description: "Your request has been received.",
    },
    {
      title: "Under Review",
      description: "The request is being reviewed.",
    },
    {
      title: "Decision Made",
      description: "A decision has been recorded.",
    },
  ];

  const getProgress = (status) => {
    if (status === "Approved") return 3;
    if (status === "In Progress") return 2;
    return 1;
  };

  const tryExample = (reference) => {
    setReferenceNumber(reference);
    setRequestStatus(null);
    setError("");
  };

  return (
    <section className="tracker-section" id="track-request">
      <div className="tracker-container">
        {/* Heading */}
        <div className="tracker-heading">
          <span className="tracker-eyebrow">
            <span className="tracker-eyebrow-dot"></span>
            REQUEST TRACKING
          </span>

          <h2>
            Your request, <span>within reach.</span>
          </h2>

          <p>
            Stay up to date with your service request. Enter your
            reference number to explore its current status.
          </p>
        </div>

        {/* Tracking layout */}
        <div className="tracker-layout">
          <div className="tracker-card">
            <div className="tracker-card-header">
              <div className="tracker-symbol" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="10.5" cy="10.5" r="6.5" />
                  <path d="m15.5 15.5 5 5" />
                  <path d="M10.5 7v3.5l2.5 1.5" />
                </svg>
              </div>

              <div>
                <h3>Check your request</h3>
                <p>
                  Use the reference number from your confirmation.
                </p>
              </div>
            </div>

            <form className="tracker-form" onSubmit={handleTrackRequest}>
              <label htmlFor="referenceNumber">
                Request reference number
              </label>

              <div className="tracker-input-wrap">
                <span aria-hidden="true">#</span>

                <input
                  id="referenceNumber"
                  type="text"
                  placeholder="e.g. PSR2026001"
                  value={referenceNumber}
                  onChange={(event) => {
                    setReferenceNumber(event.target.value);
                    if (error) setError("");
                  }}
                  autoComplete="off"
                  aria-invalid={Boolean(error)}
                  aria-describedby={
                    error ? "tracker-error" : "tracker-help"
                  }
                />
              </div>

              <small id="tracker-help" className="tracker-help">
                Your reference number is unique to your request.
              </small>

              <button type="submit" className="tracker-button">
                <span>Check status</span>
                <span aria-hidden="true">→</span>
              </button>
            </form>

            {error && (
              <div
                className="tracker-message tracker-error"
                id="tracker-error"
                role="alert"
              >
                <span aria-hidden="true">!</span>
                <p>{error}</p>
              </div>
            )}

            {requestStatus && (
              <div className="tracker-result" aria-live="polite">
                <div className="tracker-result-top">
                  <div>
                    <span className="tracker-result-label">
                      REFERENCE NUMBER
                    </span>
                    <h4>{requestStatus.reference}</h4>
                  </div>

                  <span
                    className={`tracker-status status-${requestStatus.status
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    <span className="status-dot"></span>
                    {requestStatus.status}
                  </span>
                </div>

                <div className="tracker-result-details">
                  <div>
                    <span>Service</span>
                    <strong>{requestStatus.service}</strong>
                  </div>

                  <div>
                    <span>Last updated</span>
                    <strong>{requestStatus.date}</strong>
                  </div>
                </div>

                <div className="tracker-result-message">
                  <span className="result-message-icon" aria-hidden="true">
                    i
                  </span>
                  <p>{requestStatus.message}</p>
                </div>

                <div className="tracker-progress">
                  <div className="tracker-progress-heading">
                    <h4>Request progress</h4>
                    <span>
                      {getProgress(requestStatus.status)} of 3 stages
                    </span>
                  </div>

                  <div className="tracker-progress-bar">
                    <span
                      style={{
                        width: `${
                          (getProgress(requestStatus.status) / 3) * 100
                        }%`,
                      }}
                    ></span>
                  </div>

                  <div className="tracker-timeline">
                    {progressSteps.map((step, index) => {
                      const stepNumber = index + 1;
                      const completed =
                        stepNumber <= getProgress(requestStatus.status);
                      const current =
                        stepNumber === getProgress(requestStatus.status);

                      return (
                        <div
                          className={`timeline-step ${
                            completed ? "completed" : ""
                          } ${current ? "current" : ""}`}
                          key={step.title}
                        >
                          <div className="timeline-marker">
                            {completed ? "✓" : stepNumber}
                          </div>

                          <div className="timeline-copy">
                            <strong>{step.title}</strong>
                            <span>{step.description}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="tracker-sample">
              <span>Try a demo reference</span>

              <div className="tracker-sample-buttons">
                {Object.keys(sampleRequests).map((reference) => (
                  <button
                    key={reference}
                    type="button"
                    onClick={() => tryExample(reference)}
                  >
                    {reference}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Helpful side panel */}
          <aside className="tracker-side-panel">
            <div className="tracker-side-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3 20 6v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>

            <span className="tracker-side-label">SIMPLE & TRANSPARENT</span>

            <h3>Know where things stand.</h3>

            <p>
              Request tracking helps you understand the different stages
              a service request may pass through.
            </p>

            <div className="tracker-benefit">
              <span className="benefit-check">✓</span>
              <div>
                <strong>Easy to check</strong>
                <p>Use your reference number to look up a demo request.</p>
              </div>
            </div>

            <div className="tracker-benefit">
              <span className="benefit-check">✓</span>
              <div>
                <strong>Clear status updates</strong>
                <p>See whether a sample request is submitted, in review, or approved.</p>
              </div>
            </div>

            <div className="tracker-side-note">
             
  <span aria-hidden="true">i</span>
  <p>
    Demo mode: Request statuses shown are examples.
  </p>
</div>
    
          </aside>
        </div>
      </div>
    </section>
  );
}

export default Tracker;