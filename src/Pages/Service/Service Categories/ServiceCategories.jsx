
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./ServiceCategories.css";

const categories = [
  {
    name: "All Services",
    icon: "✦",
    description: "Explore everything",
  },
  {
    name: "Identification",
    icon: "🪪",
    description: "Personal documents",
  },
  {
    name: "Business",
    icon: "💼",
    description: "Start and manage a business",
  },
  {
    name: "Education",
    icon: "🎓",
    description: "Learning and student support",
  },
  {
    name: "Local Services",
    icon: "🏡",
    description: "Community services",
  },
];

const services = [
  {
    id: 1,
    title: "National ID Information",
    category: "Identification",
    icon: "🪪",
    accent: "lavender",
    description:
      "Learn about identity document applications, replacement procedures, and the information you may need.",
    time: "Varies by service",
    tag: "Personal documents",
    requirements: [
      "Valid supporting identification, where applicable",
      "Relevant application details",
      "Any supporting documents specified by the responsible office",
    ],
  },
  {
    id: 2,
    title: "Birth Certificate Guidance",
    category: "Identification",
    icon: "📄",
    accent: "blue",
    description:
      "Explore general information about birth registration, certificate applications, and corrections.",
    time: "Varies by application",
    tag: "Civil registration",
    requirements: [
      "Birth registration details",
      "Supporting records, where applicable",
      "Additional documents requested by the responsible office",
    ],
  },
  {
    id: 3,
    title: "Business Registration Guide",
    category: "Business",
    icon: "💼",
    accent: "orange",
    description:
      "Understand the typical steps involved in registering a business and preparing your application.",
    time: "Depends on the process",
    tag: "Business setup",
    requirements: [
      "Proposed business name",
      "Applicant identification details",
      "Business information and other applicable documents",
    ],
  },
  {
    id: 4,
    title: "Business Permit Information",
    category: "Business",
    icon: "🏢",
    accent: "green",
    description:
      "Find out what to consider when applying for a business permit through the relevant local authority.",
    time: "Depends on the authority",
    tag: "Permits and licensing",
    requirements: [
      "Business details and location",
      "Relevant registration information",
      "Any documents and fees specified by the local authority",
    ],
  },
  {
    id: 5,
    title: "Student Funding Information",
    category: "Education",
    icon: "🎓",
    accent: "blue",
    description:
      "Explore general guidance on student funding, eligibility checks, and preparing application information.",
    time: "Depends on the programme",
    tag: "Student support",
    requirements: [
      "Student and institution details",
      "Relevant academic or admission information",
      "Additional documents required by the funding programme",
    ],
  },
  {
    id: 6,
    title: "Education Certificate Guidance",
    category: "Education",
    icon: "📚",
    accent: "lavender",
    description:
      "Learn about the information commonly needed when enquiring about academic certificates and records.",
    time: "Depends on the institution",
    tag: "Academic records",
    requirements: [
      "Student identification details",
      "Institution and examination details",
      "Supporting records requested by the relevant institution",
    ],
  },
  {
    id: 7,
    title: "Community Service Information",
    category: "Local Services",
    icon: "🏡",
    accent: "green",
    description:
      "Discover where to find information about community services and local administrative support.",
    time: "Depends on the service",
    tag: "Community support",
    requirements: [
      "Description of the service needed",
      "Relevant location or area details",
      "Supporting information requested by the responsible office",
    ],
  },
  {
    id: 8,
    title: "Local Service Request",
    category: "Local Services",
    icon: "📍",
    accent: "orange",
    description:
      "Use this demonstration service to understand how a local service enquiry or request might be organised.",
    time: "Demo request only",
    tag: "Local assistance",
    requirements: [
      "A clear description of your request",
      "Relevant location details",
      "Contact information if required by the service provider",
    ],
  },
];

function ServiceCategories() {
  const [activeCategory, setActiveCategory] = useState("All Services");
  const [expandedService, setExpandedService] = useState(null);

  // Read and update search parameters through React Router.
  const [searchParams, setSearchParams] = useSearchParams();

  const searchTerm = (searchParams.get("search") || "").trim();

  // Filter services by the selected category and search term.
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory =
        activeCategory === "All Services" ||
        service.category === activeCategory;

      const searchableText = [
        service.title,
        service.category,
        service.description,
        service.tag,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(
        searchTerm.toLowerCase()
      );

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  // Clear the search and restore the complete service directory.
  const resetFilters = () => {
    setSearchParams({});
    setActiveCategory("All Services");
    setExpandedService(null);
  };

  return (
    <section className="service-directory" id="available-services">
      <div className="service-directory-container">
        {/* Section introduction */}
        <div className="directory-heading">
          <div className="directory-heading-copy">
            <span className="directory-eyebrow">
              <span className="directory-eyebrow-dot"></span>
              YOUR SERVICE DIRECTORY
            </span>

            <h2>
              What can we help
              <span> you with?</span>
            </h2>

            <p>
              Start with what you need. Browse a category, explore the available
              information, and find out what to prepare before getting started.
            </p>
          </div>

          <div className="directory-heading-note">
            <span className="directory-note-icon">✦</span>

            <div>
              <strong>Everything starts here</strong>
              <span>Clear information, one convenient place.</span>
            </div>
          </div>
        </div>

        {/* Category filters */}
        <div className="service-category-area">
          <div className="service-category-heading">
            <div>
              <h3>Browse by category</h3>
              <p>Choose an area to narrow down your search.</p>
            </div>

            <span className="category-count">
              {categories.length - 1} categories
            </span>
          </div>

          <div className="service-category-list">
            {categories.map((category) => (
              <button
                key={category.name}
                type="button"
                className={`service-category-card ${
                  activeCategory === category.name ? "active" : ""
                }`}
                onClick={() => {
                  setActiveCategory(category.name);
                  setExpandedService(null);
                }}
                aria-pressed={activeCategory === category.name}
              >
                <span className="category-icon">{category.icon}</span>

                <span className="category-card-copy">
                  <strong>{category.name}</strong>
                  <small>{category.description}</small>
                </span>

                <span className="category-arrow" aria-hidden="true">
                  ↗
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Available services */}
        <div className="available-services">
          <div className="available-services-heading">
            <div>
              <span className="available-eyebrow">
                EXPLORE YOUR OPTIONS
              </span>

              <h3>
                {activeCategory === "All Services"
                  ? "All available services"
                  : activeCategory}
              </h3>

              <p>
                Find useful information and see what you may need to prepare.
              </p>
            </div>

            <span className="service-results-count">
              {filteredServices.length}{" "}
              {filteredServices.length === 1 ? "service" : "services"}
            </span>
          </div>

          {/* Search status and clear button */}
          {searchTerm && (
            <div className="service-search-status">
              <span>
                Showing results for <strong>“{searchTerm}”</strong>
              </span>

              <button type="button" onClick={resetFilters}>
                Clear search ×
              </button>
            </div>
          )}

          {/* Service cards or empty state */}
          {filteredServices.length > 0 ? (
            <div className="available-services-grid">
              {filteredServices.map((service) => {
                const isExpanded = expandedService === service.id;

                return (
                  <article
                    className={`available-service-card ${
                      isExpanded ? "service-card-expanded" : ""
                    }`}
                    key={service.id}
                  >
                    <div className="service-card-top">
                      <div
                        className={`service-card-icon ${service.accent}`}
                        aria-hidden="true"
                      >
                        {service.icon}
                      </div>

                      <span className="service-card-category">
                        {service.category}
                      </span>
                    </div>

                    <div className="service-card-content">
                      <span className="service-card-tag">
                        {service.tag}
                      </span>

                      <h4>{service.title}</h4>

                      <p>{service.description}</p>
                    </div>

                    <div className="service-card-time">
                      <span
                        className="service-time-icon"
                        aria-hidden="true"
                      >
                        ◷
                      </span>

                      <span>
                        <small>Processing information</small>
                        <strong>{service.time}</strong>
                      </span>
                    </div>

                    {/* Expandable requirements */}
                    {isExpanded && (
                      <div className="service-requirements">
                        <h5>What you may need</h5>

                        <ul>
                          {service.requirements.map((requirement) => (
                            <li key={requirement}>
                              <span aria-hidden="true">✓</span>
                              {requirement}
                            </li>
                          ))}
                        </ul>

                        <p className="requirements-disclaimer">
                          These are general examples for this demo.
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      className="service-card-button"
                      onClick={() =>
                        setExpandedService(
                          isExpanded ? null : service.id
                        )
                      }
                      aria-expanded={isExpanded}
                    >
                      {isExpanded
                        ? "Hide requirements"
                        : "View requirements"}

                      <span aria-hidden="true">
                        {isExpanded ? "↑" : "→"}
                      </span>
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="services-empty-state">
              <span className="empty-state-icon">⌕</span>

              <h4>No matching services found</h4>

              <p>
                Try another search term or browse all available categories.
              </p>

              <button type="button" onClick={resetFilters}>
                View all services
              </button>
            </div>
          )}
        </div>

      
      </div>
    </section>
  );
}

export default ServiceCategories;
