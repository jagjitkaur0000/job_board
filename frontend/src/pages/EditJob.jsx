import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import "./EditJob.css";

function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    employment_type: "",
    work_mode: "",
    experience_required: "",
    salary_min: "",
    salary_max: "",
    salary_currency: "",
    contact_email: "",
    contact_phone: "",
    benefits: "",
    preferred_gender: "",
    is_urgent: false,
    expires_at: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/jobs/${id}`);

      const job = response.data;

      setFormData({
        title: job.title || "",
        description: job.description || "",
        location: job.location || "",
        employment_type: job.employment_type || "",
        work_mode: job.work_mode || "",
        experience_required: job.experience_required || "",
        salary_min:
          job.salary_min !== null && job.salary_min !== undefined
            ? job.salary_min
            : "",
        salary_max:
          job.salary_max !== null && job.salary_max !== undefined
            ? job.salary_max
            : "",
        salary_currency: job.salary_currency || "",
        contact_email: job.contact_email || "",
        contact_phone: job.contact_phone || "",
        benefits: job.benefits || "",
        preferred_gender: job.preferred_gender || "",
        is_urgent: job.is_urgent || false,
        expires_at: job.expires_at
          ? job.expires_at.slice(0, 16)
          : "",
      });
    } catch (err) {
      console.error("Failed to load job:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load job"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.title.trim()) {
      setError("Job title is required");
      return;
    }

    if (!formData.description.trim()) {
      setError("Job description is required");
      return;
    }

    if (
      formData.salary_min !== "" &&
      formData.salary_max !== "" &&
      Number(formData.salary_min) >
        Number(formData.salary_max)
    ) {
      setError(
        "Minimum salary cannot be greater than maximum salary"
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        employment_type:
          formData.employment_type || null,
        work_mode: formData.work_mode || null,
        experience_required:
          formData.experience_required.trim() || null,
        salary_min:
          formData.salary_min === ""
            ? null
            : Number(formData.salary_min),
        salary_max:
          formData.salary_max === ""
            ? null
            : Number(formData.salary_max),
        salary_currency:
          formData.salary_currency.trim() || null,
        contact_email:
          formData.contact_email.trim() || null,
        contact_phone:
          formData.contact_phone.trim() || null,
        benefits:
          formData.benefits.trim() || null,
        preferred_gender:
          formData.preferred_gender || null,
        is_urgent: formData.is_urgent,
        expires_at:
          formData.expires_at || null,
      };

      await api.put(`/jobs/${id}`, payload);

      alert("Job updated successfully");

      navigate("/dashboard");
    } catch (err) {
      console.error(
        "Update job error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to update job"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-job-page">
        <div className="edit-job-container">
          <div className="edit-job-loading">
            Loading job...
          </div>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="edit-job-page">
        <div className="edit-job-container">
          <div className="edit-job-error">
            {error}
          </div>

          <button
            type="button"
            className="edit-job-back-button"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-job-page">
      <div className="edit-job-container">
        <div className="edit-job-header">
          <div>
            <p className="edit-job-label">
              RECRUITER
            </p>

            <h1>Edit Job</h1>

            <p>
              Update the details of your published
              job.
            </p>
          </div>

          <button
            type="button"
            className="edit-job-cancel"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>
        </div>

        {error && (
          <div className="edit-job-error">
            {error}
          </div>
        )}

        <form
          className="edit-job-form"
          onSubmit={handleSubmit}
        >
          <section className="edit-job-section">
            <h2>Basic Information</h2>

            <div className="edit-job-grid">
              <div className="edit-job-field full-width">
                <label>Job Title</label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Python Backend Developer"
                  required
                />
              </div>

              <div className="edit-job-field full-width">
                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the job..."
                  rows="7"
                  required
                />
              </div>

              <div className="edit-job-field">
                <label>Location</label>

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Berlin, Germany"
                />
              </div>

              <div className="edit-job-field">
                <label>Experience Required</label>

                <input
                  type="text"
                  name="experience_required"
                  value={
                    formData.experience_required
                  }
                  onChange={handleChange}
                  placeholder="e.g. 2-4 years"
                />
              </div>

              <div className="edit-job-field">
                <label>Employment Type</label>

                <select
                  name="employment_type"
                  value={
                    formData.employment_type
                  }
                  onChange={handleChange}
                >
                  <option value="">
                    Select employment type
                  </option>
                  <option value="full_time">
                    Full Time
                  </option>
                  <option value="part_time">
                    Part Time
                  </option>
                  <option value="contract">
                    Contract
                  </option>
                  <option value="internship">
                    Internship
                  </option>
                  <option value="temporary">
                    Temporary
                  </option>
                </select>
              </div>

              <div className="edit-job-field">
                <label>Work Mode</label>

                <select
                  name="work_mode"
                  value={formData.work_mode}
                  onChange={handleChange}
                >
                  <option value="">
                    Select work mode
                  </option>
                  <option value="remote">
                    Remote
                  </option>
                  <option value="hybrid">
                    Hybrid
                  </option>
                  <option value="onsite">
                    On-site
                  </option>
                </select>
              </div>
            </div>
          </section>

          <section className="edit-job-section">
            <h2>Salary</h2>

            <div className="edit-job-grid">
              <div className="edit-job-field">
                <label>Minimum Salary</label>

                <input
                  type="number"
                  name="salary_min"
                  value={formData.salary_min}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g. 45000"
                />
              </div>

              <div className="edit-job-field">
                <label>Maximum Salary</label>

                <input
                  type="number"
                  name="salary_max"
                  value={formData.salary_max}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g. 65000"
                />
              </div>

              <div className="edit-job-field">
                <label>Currency</label>

                <input
                  type="text"
                  name="salary_currency"
                  value={
                    formData.salary_currency
                  }
                  onChange={handleChange}
                  placeholder="e.g. EUR"
                />
              </div>
            </div>
          </section>

          <section className="edit-job-section">
            <h2>Contact Information</h2>

            <div className="edit-job-grid">
              <div className="edit-job-field">
                <label>Contact Email</label>

                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  placeholder="jobs@company.com"
                />
              </div>

              <div className="edit-job-field">
                <label>Contact Phone</label>

                <input
                  type="text"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  placeholder="+49..."
                />
              </div>

              <div className="edit-job-field full-width">
                <label>Benefits</label>

                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  placeholder="Health insurance, paid leave, remote work..."
                  rows="4"
                />
              </div>
            </div>
          </section>

          <section className="edit-job-section">
            <h2>Additional Details</h2>

            <div className="edit-job-grid">
              <div className="edit-job-field">
                <label>Preferred Gender</label>

                <select
                  name="preferred_gender"
                  value={
                    formData.preferred_gender
                  }
                  onChange={handleChange}
                >
                  <option value="">
                    No preference
                  </option>
                  <option value="male">
                    Male
                  </option>
                  <option value="female">
                    Female
                  </option>
                  <option value="other">
                    Other
                  </option>
                </select>
              </div>

              <div className="edit-job-field">
                <label>Expiry Date</label>

                <input
                  type="datetime-local"
                  name="expires_at"
                  value={formData.expires_at}
                  onChange={handleChange}
                />
              </div>

              <div className="edit-job-checkbox">
                <input
                  type="checkbox"
                  id="is_urgent"
                  name="is_urgent"
                  checked={formData.is_urgent}
                  onChange={handleChange}
                />

                <label htmlFor="is_urgent">
                  Mark this job as urgent
                </label>
              </div>
            </div>
          </section>

          <div className="edit-job-actions">
            <button
              type="button"
              className="edit-job-secondary"
              onClick={() =>
                navigate("/dashboard")
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="edit-job-save"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditJob;