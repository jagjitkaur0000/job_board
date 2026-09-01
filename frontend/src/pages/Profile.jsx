import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api";

import "./Profile.css";


function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredLocations, setPreferredLocations] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [resumeUploading, setResumeUploading] =
    useState(false);

  const [photoUploading, setPhotoUploading] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;


  // ==========================================================
  // LOAD PROFILE
  // ==========================================================

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      navigate("/login");
      return;
    }

    if (role !== "applicant") {
      navigate("/dashboard");
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await api.get("/profile/me");

        const data = response.data;

        setProfile(data);

        setFullName(data.full_name || "");
        setPhone(data.phone || "");

        setPreferredLocations(
          Array.isArray(data.preferred_locations)
            ? data.preferred_locations.join(", ")
            : ""
        );
      } catch (err) {
        console.error(
          "Profile loading error:",
          err.response?.data || err
        );

        setError(
          err.response?.data?.detail ||
            "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);


  // ==========================================================
  // UPDATE PROFILE
  // ==========================================================

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const locations = preferredLocations
        .split(",")
        .map((location) => location.trim())
        .filter(Boolean);

      const response = await api.patch(
        "/profile/me",
        {
          full_name: fullName.trim() || null,
          phone: phone.trim() || null,
          preferred_locations:
            locations.length > 0
              ? locations
              : null,
        }
      );

      setProfile(response.data);

      setMessage(
        "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "Profile update error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };


  // ==========================================================
  // UPLOAD RESUME
  // ==========================================================

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setResumeUploading(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await api.post(
        "/profile/me/resume",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProfile(response.data);

      setMessage(
        "Resume uploaded successfully."
      );
    } catch (err) {
      console.error(
        "Resume upload error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to upload resume"
      );
    } finally {
      setResumeUploading(false);

      event.target.value = "";
    }
  };


  // ==========================================================
  // UPLOAD PROFILE PHOTO
  // ==========================================================

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPhotoUploading(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await api.post(
        "/profile/me/photo",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProfile(response.data);

      setMessage(
        "Profile photo uploaded successfully."
      );
    } catch (err) {
      console.error(
        "Profile photo upload error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to upload profile photo"
      );
    } finally {
      setPhotoUploading(false);

      event.target.value = "";
    }
  };


  // ==========================================================
  // FILE URL
  // ==========================================================

  const getFileUrl = (fileUrl) => {
    if (!fileUrl) {
      return null;
    }

    if (fileUrl.startsWith("http")) {
      return fileUrl;
    }

    return `${API_URL}${fileUrl}`;
  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-loading">
            Loading profile...
          </div>
        </div>
      </div>
    );
  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="profile-page">
      <div className="profile-container">

        <div className="profile-header">
          <div>
            <p className="profile-eyebrow">
              CANDIDATE PROFILE
            </p>

            <h1>Your Profile</h1>

            <p className="profile-subtitle">
              Keep your information updated so
              recruiters can understand your
              background.
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


        {message && (
          <div className="profile-message">
            {message}
          </div>
        )}


        {error && (
          <div className="profile-error">
            {error}
          </div>
        )}


        <div className="profile-grid">

          {/* ==================================================
              PROFILE PHOTO
          ================================================== */}

          <section className="profile-card photo-card">

            <div className="card-heading">
              <div>
                <h2>Profile photo</h2>

                <p>
                  Use a professional photo.
                </p>
              </div>
            </div>

            <div className="photo-section">

              <div className="profile-photo-wrapper">

                {profile?.profile_photo_url ? (
                  <img
                    src={getFileUrl(
                      profile.profile_photo_url
                    )}
                    alt="Profile"
                    className="profile-photo"
                  />
                ) : (
                  <div className="profile-photo-placeholder">
                    {fullName
                      ? fullName
                          .charAt(0)
                          .toUpperCase()
                      : "U"}
                  </div>
                )}

              </div>

              <div className="photo-info">

                <label
                  htmlFor="profile-photo"
                  className="upload-button"
                >
                  {photoUploading
                    ? "Uploading..."
                    : "Upload photo"}
                </label>

                <input
                  id="profile-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  disabled={photoUploading}
                  hidden
                />

                <p>
                  JPG, PNG or WEBP.
                  <br />
                  Maximum size: 3 MB.
                </p>

              </div>

            </div>

          </section>


          {/* ==================================================
              ACCOUNT INFORMATION
          ================================================== */}

          <section className="profile-card">

            <div className="card-heading">
              <div>
                <h2>Account information</h2>

                <p>
                  Your login and verification details.
                </p>
              </div>
            </div>

            <div className="account-info">

              <div className="account-row">
                <span>Email</span>

                <strong>
                  {profile?.email}
                </strong>
              </div>

              <div className="account-row">
                <span>Email status</span>

                {profile?.email_verified ? (
                  <span className="verified-badge">
                    Verified
                  </span>
                ) : (
                  <span className="unverified-badge">
                    Not verified
                  </span>
                )}
              </div>

            </div>

          </section>


          {/* ==================================================
              PERSONAL INFORMATION
          ================================================== */}

          <section className="profile-card profile-form-card">

            <div className="card-heading">
              <div>
                <h2>Personal information</h2>

                <p>
                  Add the information recruiters
                  can use to contact you.
                </p>
              </div>
            </div>


            <form
              onSubmit={handleSaveProfile}
              className="profile-form"
            >

              <div className="form-group">

                <label htmlFor="full-name">
                  Full name
                </label>

                <input
                  id="full-name"
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(
                      event.target.value
                    )
                  }
                  placeholder="Enter your full name"
                  minLength={2}
                  maxLength={255}
                />

              </div>


              <div className="form-group">

                <label htmlFor="phone">
                  Phone number
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value
                    )
                  }
                  placeholder="Enter your phone number"
                  maxLength={50}
                />

              </div>


              <div className="form-group">

                <label htmlFor="preferred-locations">
                  Preferred job locations
                </label>

                <input
                  id="preferred-locations"
                  type="text"
                  value={preferredLocations}
                  onChange={(event) =>
                    setPreferredLocations(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Ludhiana, Chandigarh, Delhi"
                />

                <small>
                  Separate multiple locations
                  with commas.
                </small>

              </div>


              <button
                type="submit"
                className="save-profile-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save changes"}
              </button>

            </form>

          </section>


          {/* ==================================================
              RESUME
          ================================================== */}

          <section className="profile-card">

            <div className="card-heading">
              <div>
                <h2>Resume</h2>

                <p>
                  Upload the resume recruiters
                  should see when you apply.
                </p>
              </div>
            </div>


            <div className="resume-section">

              {profile?.resume_url ? (
                <div className="resume-existing">

                  <div className="resume-icon">
                    PDF
                  </div>

                  <div className="resume-details">

                    <strong>
                      Resume uploaded
                    </strong>

                    <span>
                      Your current resume is
                      available to recruiters.
                    </span>

                  </div>

                  <a
                    href={getFileUrl(
                      profile.resume_url
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-resume-button"
                  >
                    View
                  </a>

                </div>
              ) : (
                <div className="resume-empty">

                  <div className="resume-icon">
                    CV
                  </div>

                  <div>
                    <strong>
                      No resume uploaded
                    </strong>

                    <span>
                      Upload a PDF, DOC or DOCX
                      file.
                    </span>
                  </div>

                </div>
              )}


              <label
                htmlFor="resume"
                className="resume-upload-button"
              >
                {resumeUploading
                  ? "Uploading..."
                  : profile?.resume_url
                    ? "Replace resume"
                    : "Upload resume"}
              </label>

              <input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                disabled={resumeUploading}
                hidden
              />

              <p className="upload-help">
                PDF, DOC or DOCX.
                Maximum size: 5 MB.
              </p>

            </div>

          </section>

        </div>

      </div>
    </div>
  );
}


export default Profile;