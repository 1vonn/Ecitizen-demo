
import { useState } from "react";
import { Link } from "react-router-dom";
import "./HowItWorksSupport.css";

const steps = [
  {
    number: "01",
    icon: "⌕",
    title: "Find your service",
    description:
      "Browse service categories or use the search bar to find information relevant to your needs.",
    label: "Explore",
  },
  {
    number: "02",
    icon: "✎",
    title: "Submit a request",
    description:
      "Follow the instructions provided for your service and enter the required information.",
    label: "Get started",
  },
  {
    number: "03",
    icon: "▤",
    title: "Keep your reference",
    description:
      "In a real service workflow, you would receive a reference number to help identify your request.",
    label: "Stay organised",
  },
  {
    number: "04",
    icon: "↗",
    title: "Track progress",
    description:
      "Use the tracking page to check the status of a request in the demonstration system.",
    label: "Stay updated",
  },
];

const faqs = [
  {
    question: "How do I find the service I need?",
    answer:
      "Visit the service directory and browse the categories or enter a keyword in the search bar. Select a service to explore its description and example requirements.",
  },
  {
    question: "How can I track a request?",
    answer:
      "Open the Track Request page. In a fully connected system, you would enter your reference number to view the latest status. Tracking in this project depends on the functionality implemented on that page.",
  },
  {
    question: "What if I do not have a reference number?",
    answer:
      "A reference number would normally be provided after a request is submitted successfully. This demonstration does not guarantee that a real request will be created or that a reference number will be issued.",
  },
  {
    question: "Is HudumaConnect an official government website?",
    answer:
      "No. HudumaConnect is an independent demonstration project inspired by digital public service portals. It is not affiliated with the Kenyan government and does not provide official government services.",
  },
];

function HowItWorksSupport() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section className="how-support-section" id="how-it-works">
      <div className="how-support-container">
        {/* Section heading */}
        <div className="how-support-heading">
          <span className="how-support-eyebrow">
            <span className="how-support-eyebrow-dot"></span>
            HERE TO MAKE THINGS EASIER
          </span>

          <h2>
            Simple steps.
            <span> Clear guidance.</span>
          </h2>

          <p>
            Discover how a service request can move from your first search
            to checking its progress, with helpful information along the way.
          </p>
        </div>

        {/* How it works */}
        <div className="how-works-block">
          <div className="how-works-title-row">
            <div>
              <span className="how-block-kicker">THE PROCESS</span>
              <h3>How it works</h3>
            </div>

            <span className="how-works-side-note">
              <span aria-hidden="true">✦</span>
              Four steps to get started
            </span>
          </div>

          <div className="how-steps-grid">
            {steps.map((step, index) => (
              <article className="how-step-card" key={step.number}>
                <div className="how-step-top">
                  <span className="how-step-number">{step.number}</span>

                  <span className="how-step-icon" aria-hidden="true">
                    {step.icon}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <span className="how-step-connector" aria-hidden="true">
                    →
                  </span>
                )}

                <span className="how-step-label">{step.label}</span>

                <h4>{step.title}</h4>

                <p>{step.description}</p>
              </article>
            ))}
          </div>

          <div className="how-works-bottom">
            <div className="how-bottom-icon" aria-hidden="true">
              ✨
            </div>

            <div className="how-bottom-copy">
              <strong>Ready to explore your options?</strong>
              <span>
                Start with the service directory and find the information
                you need.
              </span>
            </div>

            <Link to="/services" className="how-bottom-link">
              Explore services <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        {/* Help and support */}
        <div className="help-support-layout" id="help-support">
          <div className="help-support-intro">
            <span className="help-support-eyebrow">WE'RE HERE TO HELP</span>

            <h3>
              Questions?
              <br />
              <span>We've got answers.</span>
            </h3>

            <p>
              Find quick answers to common questions about using
              HudumaConnect and exploring the demonstration services.
            </p>

            <div className="support-promise">
              <span className="support-promise-icon" aria-hidden="true">
                ♡
              </span>

              <div>
                <strong>Guidance made simple</strong>
                <span>
                  Clear information to help you find your way.
                </span>
              </div>
            </div>

            <Link to="/about" className="support-contact-link">
              Learn more about HudumaConnect
              <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="faq-panel">
            <div className="faq-panel-heading">
              <div>
                <span className="faq-heading-icon" aria-hidden="true">
                  ?
                </span>

                <div>
                  <h4>Frequently asked questions</h4>
                  <p>Quick answers to help you get started.</p>
                </div>
              </div>

              <span className="faq-count">0{faqs.length}</span>
            </div>

            <div className="faq-list">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <article
                    className={`faq-item ${isOpen ? "faq-item-open" : ""}`}
                    key={faq.question}
                  >
                    <button
                      type="button"
                      className="faq-question"
                      onClick={() =>
                        setOpenFaq(isOpen ? null : index)
                      }
                      aria-expanded={isOpen}
                    >
                      <span className="faq-question-text">
                        <span className="faq-question-number">
                          0{index + 1}
                        </span>

                        {faq.question}
                      </span>

                      <span className="faq-toggle" aria-hidden="true">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            <div className="faq-panel-footer">
              <span>
                <span className="faq-footer-dot"></span>
                Still exploring? We're here to guide you.
              </span>

              <Link to="/track-request">
                Track a request <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Demonstration notice */}
        <div className="how-support-disclaimer">
          <span aria-hidden="true">ⓘ</span>

          <p>
            <strong>Demo project notice:</strong> These steps illustrate a
            typical digital request journey. Actual submission, reference
            numbers, status updates, and support services depend on the
            features implemented in this demonstration.
          </p>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSupport;
