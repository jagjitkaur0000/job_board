import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api";

import "./ScheduleInterview.css";


function ScheduleInterview() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const [scheduledAt, setScheduledAt] =
    useState("");

  const [meetingLink, setMeetingLink] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!scheduledAt) {
      setError(
        "Please select an interview date and time."
      );
      return;
    }

    try {
      setLoading(true);

      const date = new Date(scheduledAt);

      if (Number.isNaN(date.getTime())) {
        setError(
          "Invalid interview date and time."
        );
        return;
      }

      await api.post(
        `/interviews/applications/${applicationId}`,
        {
          scheduled_at: date.toISOString(),

          meeting_link:
            meetingLink.trim() || null,

          message:
            message.trim() || null,
        }
      );

      alert(
        "Interview scheduled successfully. The candidate has been notified."
      );

      navigate("/dashboard");

    } catch (err) {

      console.error(
        "Schedule interview error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to schedule interview."
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="schedule-interview-page">

      <div className="schedule-interview-container">

        <div className="schedule-interview-header">

          <p className="section-label">
            RECRUITER
          </p>

          <h1>
            Schedule Interview
          </h1>

          <p>
            Schedule an interview for this
            shortlisted candidate.
          </p>

        </div>


        {error && (
          <div className="schedule-error">
            {error}
          </div>
        )}


        <form
          className="schedule-form"
          onSubmit={handleSubmit}
        >

          <label>
            Interview date and time

            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) =>
                setScheduledAt(
                  event.target.value
                )
              }
              required
            />

          </label>


          <label>
            Meeting link

            <input
              type="url"
              placeholder="https://meet.google.com/..."
              value={meetingLink}
              onChange={(event) =>
                setMeetingLink(
                  event.target.value
                )
              }
            />

          </label>


          <label>
            Message for candidate

            <textarea
              rows="5"
              placeholder="Please join 5 minutes before the interview..."
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value
                )
              }
            />

          </label>


          <div className="schedule-actions">

            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Scheduling..."
                : "Schedule Interview"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


export default ScheduleInterview;