import { useEffect, useMemo, useState } from "react";

import api from "../api";

import JobCard from "../components/JobCard";

import "./Jobs.css";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const limit = 10;

  const [sort, setSort] = useState("newest");

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  const [activeFilter, setActiveFilter] =
    useState(null);

  const applyJob = async (jobId) => {
    try {
      await api.post(
        `/applications/jobs/${jobId}/apply`
      );

      alert("Applied successfully");
    } catch (err) {
      console.error(
        "Apply error:",
        err.response?.data
      );

      alert(
        err.response?.data?.detail ||
          "Failed to apply"
      );
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get("/jobs", {
          params: {
            page,
            limit,
            sort,
          },
        });

        const data = res.data;

        if (
          data &&
          Array.isArray(data.items)
        ) {
          setJobs(data.items);
          setTotal(
            data.total || data.items.length
          );
        } else if (Array.isArray(data)) {
          setJobs(data);
          setTotal(data.length);
        } else {
          console.error(
            "Unexpected API response:",
            data
          );

          setJobs([]);
          setTotal(0);
        }
      } catch (err) {
        console.error(
          "Fetch jobs error:",
          err.response || err
        );

        setError("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [page, sort]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchValue =
        search.toLowerCase().trim();

      const locationValue =
        location.toLowerCase().trim();

      const title =
        job.title?.toLowerCase() || "";

      const company =
        job.company?.name?.toLowerCase() ||
        "";

      const jobLocation =
        job.location?.toLowerCase() || "";

      const workMode =
        job.work_mode?.toLowerCase() || "";

      const employmentType =
        job.employment_type?.toLowerCase() ||
        "";

      const matchesSearch =
        !searchValue ||
        title.includes(searchValue) ||
        company.includes(searchValue);

      const matchesLocation =
        !locationValue ||
        jobLocation.includes(locationValue);

      let matchesQuickFilter = true;

      if (activeFilter === "remote") {
        matchesQuickFilter =
          workMode === "remote";
      }

      if (activeFilter === "full-time") {
        matchesQuickFilter =
          employmentType === "full-time";
      }

      if (activeFilter === "part-time") {
        matchesQuickFilter =
          employmentType === "part-time";
      }

      if (activeFilter === "urgent") {
        matchesQuickFilter =
          job.is_urgent === true;
      }

      return (
        matchesSearch &&
        matchesLocation &&
        matchesQuickFilter
      );
    });
  }, [
    jobs,
    search,
    location,
    activeFilter,
  ]);

  const handleSearch = () => {
    setPage(1);
  };

  const toggleFilter = (filter) => {
    setActiveFilter((current) =>
      current === filter
        ? null
        : filter
    );
  };

  if (loading) {
    return (
      <div className="jobs-page">
        <div className="jobs-container">
          <div className="jobs-loading">
            Loading opportunities...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="jobs-page">
        <div className="jobs-container">
          <div className="jobs-error">
            <h2>Something went wrong</h2>

            <p>{error}</p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="jobs-page">
      <section className="jobs-hero">
        <div className="jobs-container">
          <div className="hero-content">
            <p className="hero-label">
              FIND YOUR NEXT OPPORTUNITY
            </p>

            <h1>
              Find work that moves
              <span> your career forward.</span>
            </h1>

            <p className="hero-description">
              Discover opportunities from
              companies looking for your
              skills.
            </p>
          </div>

          <div className="job-search-panel">
            <div className="search-field">
              <label htmlFor="job-search">
                What
              </label>

              <input
                id="job-search"
                type="text"
                placeholder="Job title or company"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
            </div>

            <div className="search-field">
              <label htmlFor="job-location">
                Where
              </label>

              <input
                id="job-location"
                type="text"
                placeholder="City or location"
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
            </div>

            <button
              type="button"
              className="search-button"
              onClick={handleSearch}
            >
              Search jobs
            </button>
          </div>

          <div className="quick-filters">
            <span>Popular:</span>

            <button
              type="button"
              className={
                activeFilter === "remote"
                  ? "filter-chip active"
                  : "filter-chip"
              }
              onClick={() =>
                toggleFilter("remote")
              }
            >
              Remote
            </button>

            <button
              type="button"
              className={
                activeFilter === "full-time"
                  ? "filter-chip active"
                  : "filter-chip"
              }
              onClick={() =>
                toggleFilter("full-time")
              }
            >
              Full-time
            </button>

            <button
              type="button"
              className={
                activeFilter === "part-time"
                  ? "filter-chip active"
                  : "filter-chip"
              }
              onClick={() =>
                toggleFilter("part-time")
              }
            >
              Part-time
            </button>

            <button
              type="button"
              className={
                activeFilter === "urgent"
                  ? "filter-chip active"
                  : "filter-chip"
              }
              onClick={() =>
                toggleFilter("urgent")
              }
            >
              Urgent
            </button>
          </div>
        </div>
      </section>

      <section className="jobs-section">
        <div className="jobs-container">
          <div className="jobs-toolbar">
            <div>
              <p className="section-label">
                AVAILABLE POSITIONS
              </p>

              <h2>
                {total}{" "}
                {total === 1
                  ? "opportunity"
                  : "opportunities"}
              </h2>
            </div>

            <div className="sort-control">
              <label htmlFor="sort">
                Sort by
              </label>

              <select
                id="sort"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
              >
                <option value="newest">
                  Newest first
                </option>

                <option value="oldest">
                  Oldest first
                </option>
              </select>
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="empty-state">
              <h2>No matching jobs found</h2>

              <p>
                Try changing your search,
                location, or filters.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setLocation("");
                  setActiveFilter(null);
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="jobs-list">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={applyJob}
                />
              ))}
            </div>
          )}

          <div className="pagination">
            {page > 1 && (
              <button
                className="pagination-button"
                onClick={() =>
                  setPage(page - 1)
                }
              >
                ← Previous
              </button>
            )}

            <span className="page-number">
              Page {page}
            </span>

            {page * limit < total && (
              <button
                className="pagination-button"
                onClick={() =>
                  setPage(page + 1)
                }
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Jobs;