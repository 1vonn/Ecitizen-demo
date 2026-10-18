
import "./HowItWorks.css";

const steps = [
  {
    number: "01",
    title: "Choose a Service",
    description:
      "Explore the available public services and select the one that matches your needs.",
    tag: "SELECT",
  },
  {
    number: "02",
    title: "Submit Your Request",
    description:
      "Complete the required details and submit your service request through the portal.",
    tag: "SUBMIT",
  },
  {
    number: "03",
    title: "Track Progress",
    description:
      "Use your application reference number to check the status of your submitted request.",
    tag: "TRACK",
  },
];

const benefits = [
  {
    number: "01",
    title: "Convenient Access",
    description:
      "Explore public service information from one convenient online portal.",
  },
  {
    number: "02",
    title: "Transparent Tracking",
    description:
      "Check your request status using your unique application reference number.",
  },
  {
    number: "03",
    title: "One Central Portal",
    description:
      "Find different service categories without navigating multiple sections.",
  },
  {
    number: "04",
    title: "Simple Process",
    description:
      "Follow clear steps to select a service, submit a request, and check its progress.",
  },
];

function HowItWorks() {
  return (
    <section className="process-section" id="how-it-works">
      <div className="process-container">
        {/* Section Introduction */}
        <div className="process-heading">
          <span className="process-eyebrow">HOW THE PORTAL WORKS</span>

          <h2>
            Public Services, <span>Made Easier.</span>
          </h2>

          <p>
            A simple way to explore services, submit requests, and follow
            their progress from one central place.
          </p>
        </div>

        {/* How It Works */}
        <div className="process-subheading">
          <h3>How It Works</h3>
          <p>Three simple steps to get started.</p>
        </div>

        <div className="process-steps-grid">
          {steps.map((step) => (
            <article className="process-step-card" key={step.number}>
              <div className="process-step-top">
                <span className="process-step-number">{step.number}</span>
                <span className="process-step-tag">{step.tag}</span>
              </div>

              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </article>
          ))}
        </div>

        {/* Benefits */}
        <div className="process-benefits">
          <div className="process-subheading benefits-heading">
            <h3>Why Use Our Portal?</h3>
            <p>Designed to make accessing public service information simpler.</p>
          </div>

          <div className="process-benefits-grid">
            {benefits.map((benefit) => (
              <article className="process-benefit-card" key={benefit.number}>
                <span className="process-benefit-number">
                  {benefit.number}
                </span>

                <h4>{benefit.title}</h4>
                <p>{benefit.description}</p>
              </article>
            ))}
          </div>
        </div>

        {/* <div className="process-disclaimer">
          <p>
            <strong>Project demonstration:</strong> This portal demonstrates
            a proposed public service request experience. 
          </p>
        </div> */}
      </div>
    </section>
  );
}

export default HowItWorks;
