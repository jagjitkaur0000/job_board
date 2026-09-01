import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api";
import "./PostJob.css";

function PostJob() {
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [loadingCompany, setLoadingCompany] =
    useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    employment_type: "full_time",
    work_mode: "onsite",
    experience_required: "",
    salary_min: "",
    salary_max: "",
    salary_currency: "INR",
    contact_email: "",
    contact_phone: "",
    benefits: "",
    preferred_gender: "",
    is_urgent: false,
    expires_at: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const res = await api.get(
        "/companies/me"
      );

      if (!res.data?.id) {
        setCompany(null);
        return;
      }

      setCompany(res.data);
    } catch (err) {
      console.error(
        "Company fetch error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load company"
      );
    } finally {
      setLoadingCompany(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } =
      e.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!company?.id) {
      setError(
        "You must create a company before posting a job."
      );
      return;
    }

    setError("");
    setSubmitting(true);

    if (
      form.salary_min !== "" &&
      form.salary_max !== "" &&
      Number(form.salary_min) >
        Number(form.salary_max)
    ) {
      setError(
        "Minimum salary cannot be greater than maximum salary."
      );
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        title: form.title.trim(),
        description:
          form.description.trim(),

        location:
          form.location.trim() || null,

        employment_type:
          form.employment_type,

        work_mode:
          form.work_mode,

        experience_required:
          form.experience_required.trim() ||
          null,

        salary_min:
          form.salary_min === ""
            ? null
            : Number(form.salary_min),

        salary_max:
          form.salary_max === ""
            ? null
            : Number(form.salary_max),

        salary_currency:
          form.salary_currency.trim() ||
          "INR",

        contact_email:
          form.contact_email.trim() ||
          null,

        contact_phone:
          form.contact_phone.trim() ||
          null,

        benefits:
          form.benefits.trim() || null,

        preferred_gender:
          form.preferred_gender || null,

        is_urgent:
          form.is_urgent,

        expires_at:
          form.expires_at
            ? new Date(
                form.expires_at
              ).toISOString()
            : null,
      };

      const res = await api.post(
        `/jobs/companies/${company.id}`,
        payload
      );

      console.log(
        "Job created:",
        res.data
      );

      alert(
        "Job posted successfully."
      );

      navigate("/");
    } catch (err) {
      console.error(
        "Post job error:",
        err.response?.data || err
      );

      const detail =
        err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map(
              (item) =>
                item.msg
            )
            .join(", ")
        );
      } else {
        setError(
          detail ||
            "Failed to post job."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCompany) {
    return (
      <div className="post-job-page">
        <div className="post-job-container">
          <div className="post-job-loading">
            Loading company...
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="post-job-page">
        <div className="post-job-container">
          <div className="post-job-empty">
            <p className="form-eyebrow">
              RECRUITER
            </p>

            <h1>
              Create your company first
            </h1>

            <p>
              You need a company profile before
              you can publish jobs.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/company")
              }
            >
              Create Company
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="post-job-page">
      <div className="post-job-container">

        <div className="post-job-header">
          <div>
            <p className="form-eyebrow">
              RECRUITER
            </p>

            <h1>
              Post a new job
            </h1>

            <p>
              Publish an opportunity for
              candidates to discover and apply.
            </p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Back to dashboard
          </button>
        </div>

        <div className="company-summary">
          <span className="company-summary-label">
            POSTING FOR
          </span>

          <strong>
            {company.name}
          </strong>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <form
          className="post-job-form"
          onSubmit={handleSubmit}
        >

          {/* BASIC INFORMATION */}

          <section className="form-section">
            <div className="form-section-header">
              <h2>
                Basic information
              </h2>

              <p>
                Tell candidates what the role is
                about.
              </p>
            </div>

            <div className="form-grid">

              <div className="form-group form-group-full">
                <label htmlFor="title">
                  Job title *
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g. Junior Python Developer"
                  value={form.title}
                  onChange={handleChange}
                  minLength={3}
                  maxLength={255}
                  required
                />
              </div>

              <div className="form-group form-group-full">
                <label htmlFor="description">
                  Job description *
                </label>

                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe the responsibilities, requirements and role..."
                  value={form.description}
                  onChange={handleChange}
                  minLength={10}
                  rows={7}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">
                  Location
                </label>

                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g. Berlin, Germany"
                  value={form.location}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="experience_required">
                  Experience required
                </label>

                <input
                  id="experience_required"
                  name="experience_required"
                  type="text"
                  placeholder="e.g. 1-2 years"
                  value={
                    form.experience_required
                  }
                  onChange={handleChange}
                />
              </div>

            </div>
          </section>

          {/* EMPLOYMENT */}

          <section className="form-section">
            <div className="form-section-header">
              <h2>
                Employment details
              </h2>

              <p>
                Define how and where the candidate
                will work.
              </p>
            </div>

            <div className="form-grid">

              <div className="form-group">
                <label htmlFor="employment_type">
                  Employment type *
                </label>

                <select
                  id="employment_type"
                  name="employment_type"
                  value={
                    form.employment_type
                  }
                  onChange={handleChange}
                  required
                >
                  <option value="full_time">
                    Full-time
                  </option>

                  <option value="part_time">
                    Part-time
                  </option>

                  <option value="contract">
                    Contract
                  </option>

                  <option value="internship">
                    Internship
                  </option>

                  <option value="freelance">
                    Freelance
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="work_mode">
                  Work mode *
                </label>

                <select
                  id="work_mode"
                  name="work_mode"
                  value={form.work_mode}
                  onChange={handleChange}
                  required
                >
                  <option value="onsite">
                    On-site
                  </option>

                  <option value="remote">
                    Remote
                  </option>

                  <option value="hybrid">
                    Hybrid
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="preferred_gender">
                  Preferred gender
                </label>

                <select
                  id="preferred_gender"
                  name="preferred_gender"
                  value={
                    form.preferred_gender
                  }
                  onChange={handleChange}
                >
                  <option value="">
                    No preference
                  </option>

                  <option value="female">
                    Female
                  </option>

                  <option value="male">
                    Male
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>
              </div>

            </div>
          </section>

          {/* SALARY */}

          <section className="form-section">
            <div className="form-section-header">
              <h2>
                Salary
              </h2>

              <p>
                Add a salary range so candidates
                know what to expect.
              </p>
            </div>

            <div className="form-grid">

              <div className="form-group">
                <label htmlFor="salary_currency">
                  Currency
                </label>

                <select
                  id="salary_currency"
                  name="salary_currency"
                  value={
                    form.salary_currency
                  }
                  onChange={handleChange}
                >
                  <option value="INR">
                    INR
                  </option>

                  <option value="EUR">
                    EUR
                  </option>

                  <option value="USD">
                    USD
                  </option>

                  <option value="CAD">
                    CAD
                  </option>

                  <option value="GBP">
                    GBP
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="salary_min">
                  Minimum salary
                </label>

                <input
                  id="salary_min"
                  name="salary_min"
                  type="number"
                  min="0"
                  placeholder="e.g. 40000"
                  value={form.salary_min}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="salary_max">
                  Maximum salary
                </label>

                <input
                  id="salary_max"
                  name="salary_max"
                  type="number"
                  min="0"
                  placeholder="e.g. 55000"
                  value={form.salary_max}
                  onChange={handleChange}
                />
              </div>

            </div>
          </section>

          {/* CONTACT */}

          <section className="form-section">
            <div className="form-section-header">
              <h2>
                Contact information
              </h2>

              <p>
                Give candidates a way to contact
                the recruiter.
              </p>
            </div>

            <div className="form-grid">

              <div className="form-group">
                <label htmlFor="contact_email">
                  Contact email
                </label>

                <input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  placeholder="recruiter@company.com"
                  value={
                    form.contact_email
                  }
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact_phone">
                  Contact phone
                </label>

                <input
                  id="contact_phone"
                  name="contact_phone"
                  type="tel"
                  placeholder="+49 123 456789"
                  value={
                    form.contact_phone
                  }
                  onChange={handleChange}
                />
              </div>

            </div>
          </section>

          {/* BENEFITS */}

          <section className="form-section">
            <div className="form-section-header">
              <h2>
                Additional information
              </h2>

              <p>
                Add benefits and publishing options.
              </p>
            </div>

            <div className="form-grid">

              <div className="form-group form-group-full">
                <label htmlFor="benefits">
                  Benefits
                </label>

                <textarea
                  id="benefits"
                  name="benefits"
                  placeholder="e.g. Health insurance, remote work, paid leave..."
                  value={form.benefits}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label htmlFor="expires_at">
                  Application deadline
                </label>

                <input
                  id="expires_at"
                  name="expires_at"
                  type="datetime-local"
                  value={
                    form.expires_at
                  }
                  onChange={handleChange}
                />
              </div>

              <div className="urgent-option">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_urgent"
                    checked={
                      form.is_urgent
                    }
                    onChange={handleChange}
                  />

                  <span>
                    Mark as urgent hiring
                  </span>
                </label>

                <p>
                  Highlight this job as an urgent
                  recruitment opportunity.
                </p>
              </div>

            </div>
          </section>

          {/* ACTIONS */}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() =>
                navigate("/dashboard")
              }
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-job-button"
              disabled={submitting}
            >
              {submitting
                ? "Publishing..."
                : "Publish job"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default PostJob;