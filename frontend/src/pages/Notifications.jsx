import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api";

import "./Notifications.css";


function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    const token =
      localStorage.getItem("token");

    const role =
      localStorage.getItem("role");

    if (!token) {
      navigate("/login");
      return;
    }

    if (role !== "applicant") {
      navigate("/dashboard");
      return;
    }

    fetchNotifications();
  }, [navigate]);


  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/notifications");

      setNotifications(
        response.data || []
      );
    } catch (err) {
      console.error(
        "Notification error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };


  const markAsRead = async (
    notificationId
  ) => {
    try {
      const response =
        await api.patch(
          `/notifications/${notificationId}/read`
        );

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? response.data
            : notification
        )
      );
    } catch (err) {
      console.error(
        "Mark notification error:",
        err.response?.data || err
      );
    }
  };


  const markAllAsRead = async () => {
    try {
      await api.patch(
        "/notifications/read-all"
      );

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (err) {
      console.error(
        "Mark all notifications error:",
        err.response?.data || err
      );
    }
  };


  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "";
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };


  if (loading) {
    return (
      <div className="notifications-page">
        <div className="notifications-container">
          Loading notifications...
        </div>
      </div>
    );
  }


  return (
    <div className="notifications-page">
      <div className="notifications-container">

        <div className="notifications-header">

          <div>
            <p className="section-label">
              CANDIDATE
            </p>

            <h1>
              Notifications
            </h1>

            <p>
              Application and interview
              updates appear here.
            </p>
          </div>


          {notifications.some(
            (notification) =>
              !notification.is_read
          ) && (
            <button
              type="button"
              onClick={markAllAsRead}
            >
              Mark all as read
            </button>
          )}

        </div>


        {error && (
          <div className="notifications-error">
            {error}
          </div>
        )}


        {notifications.length === 0 ? (
          <div className="notifications-empty">
            <h2>
              No notifications
            </h2>

            <p>
              You are all caught up.
            </p>
          </div>
        ) : (
          <div className="notifications-list">

            {notifications.map(
              (notification) => (
                <article
                  key={notification.id}
                  className={`notification-card ${
                    notification.is_read
                      ? "read"
                      : "unread"
                  }`}
                >

                  <div className="notification-card-top">

                    <div>
                      <h2>
                        {notification.title}
                      </h2>

                      <p className="notification-date">
                        {formatDate(
                          notification.created_at
                        )}
                      </p>
                    </div>


                    {!notification.is_read && (
                      <span className="notification-new">
                        NEW
                      </span>
                    )}

                  </div>


                  <p className="notification-message">
                    {notification.message}
                  </p>


                  <div className="notification-actions">

                    {!notification.is_read && (
                      <button
                        type="button"
                        onClick={() =>
                          markAsRead(
                            notification.id
                          )
                        }
                      >
                        Mark as read
                      </button>
                    )}


                    {notification.type.includes(
                      "interview"
                    ) && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            "/interviews"
                          )
                        }
                      >
                        View interviews
                      </button>
                    )}

                  </div>

                </article>
              )
            )}

          </div>
        )}

      </div>
    </div>
  );
}


export default Notifications;