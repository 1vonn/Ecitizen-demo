
import { useState } from "react";
import { Link } from "react-router-dom";
import "./Services.css";

const services = [
  {
    number: "01",
    category: "BUSINESS",
    group: "Business",
    title: "Business Permits",
    icon: "💼",
    description:
      "Explore business permit applications, renewals, and related licensing services.",
    link: "/services",
    color: "purple",
    time: "Application guidance",
  },
  {
    number: "02",
    category: "CIVIL REGISTRATION",
    group: "Personal",
    title: "Birth Certificates",
    icon: "📄",
    description:
      "Find information about birth registration and birth certificate applications.",
    link: "/services",
    color: "blue",
    time: "Registration guidance",
  },
  {
    number: "03",
    category: "LAND",
    group: "Land",
    title: "Land Services",
    icon: "🏡",
    description:
      "Explore land records, land searches, and other land-related services.",
    link: "/services",
    color: "green",
    time: "Land information",
  },
  {
    number: "04",
    category: "IDENTIFICATION",
    group: "Personal",
    title: "National ID Services",
    icon: "🪪",
    description:
      "Find guidance on identification services and related application processes.",
    link: "/services",
    color: "orange",
    time: "Identification guidance",
  },
  {
    number: "05",
    category: "TAX",
    group: "Tax",
    title: "Tax Services",
    icon: "📊",
    description:
      "Explore tax information, tax registration, and tax compliance services.",
    link: "/services",
    color: "pink",
    time: "Tax information",
  },
  {
    number: "06",
    category: "PUBLIC SUPPORT",
    group: "Support",
    title: "Public Complaints",
    icon: "💬",
    description:
      "Explore how to submit a complaint or feedback request.",
    link: "/services",
    color: "teal",
    time: "Public feedback",
  },
];

const categories = [
  "All Services",
  "Personal",
  "Business",
  "Land",
  "Tax",
  "Support",
];

function Services() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Services");

  const filteredServices = services.filter((service) => {
    const matchesCategory =
      activeCategory === "All Services" ||
      service.group === activeCategory;

    const searchText = searchTerm.toLowerCase().trim();

    const matchesSearch =
      service.title.toLowerCase().includes(searchText) ||
      service.category.toLowerCase().includes(searchText) ||
      service.description.toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

  return (
    <section className="services-section" id="services">
      <div className="services-container">
        {/* Page heading */}
        <div className="services-heading">
          <span className="services-eyebrow">
            <span className="eyebrow-dot"></span>
            YOUR PUBLIC SERVICE DIRECTORY
          </span>

          <h2>
            Find the service <span>you need.</span>
          </h2>

          <p>
            Explore public service information in one convenient place.
            Search, browse categories, and find the guidance you need.
          </p>
        </div>

        {/* Search and categories */}
        <div className="services-tools">
          <div className="services-search">
            <span className="search-icon" aria-hidden="true">
              ⌕
            </span>

            <input
              type="search"
              placeholder="Search for a service..."
              aria-label="Search public services"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            {searchTerm && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div
            className="services-filters"
            aria-label="Filter services"
          >
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`filter-btn ${
                  activeCategory === category ? "active" : ""
                }`}
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results heading */}
        <div className="services-results-heading">
          <div>
            <h3>Explore our services</h3>
            <p>
              Find useful information and explore available services.
            </p>
          </div>

          <span className="results-count">
            {filteredServices.length}{" "}
            {filteredServices.length === 1 ? "service" : "services"}
          </span>
        </div>

        {/* Service cards */}
        {filteredServices.length > 0 ? (
          <div className="services-grid">
            {filteredServices.map((service) => (
              <article
                className="service-card"
                key={service.number}
              >
                <div className="service-card-top">
                  <div
                    className={`service-icon ${service.color}`}
                    aria-hidden="true"
                  >
                    {service.icon}
                  </div>

                  <span className="service-number">
                    {service.number}
                  </span>
                </div>

                <span className="service-category">
                  {service.category}
                </span>

                <h3>{service.title}</h3>

                <p className="service-description">
                  {service.description}
                </p>

                <div className="service-info">
                  <span className="info-dot"></span>
                  {service.time}
                </div>

                <div className="service-card-bottom">
                  <Link
                    to={service.link}
                    className="service-link"
                    aria-label={`Explore ${service.title}`}
                  >
                    Explore <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="services-empty">
            <span className="empty-icon" aria-hidden="true">
              🔎
            </span>

            <h3>No services found</h3>

            <p>
              Try another search term or choose a different category.
            </p>

            <button
              type="button"
              className="reset-filters-btn"
              onClick={() => {
                setSearchTerm("");
                setActiveCategory("All Services");
              }}
            >
              View all services
            </button>
          </div>
        )}

        {/* Bottom information */}
        <div className="services-footer">
          <div className="footer-info-icon" aria-hidden="true">
            <span>i</span>
          </div>

          

          <Link to="/track-request" className="all-services-link">
            Track a request <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Services;
