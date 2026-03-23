import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get("/jobs", {
          params: { page, limit, sort },
        });

        const data = res.data;

        // Case 1: paginated response
        if (data && Array.isArray(data.items)) {
          setJobs(data.items);
          setTotal(data.total || data.items.length);
        }
        // Case 2: simple list
        else if (Array.isArray(data)) {
          setJobs(data);
          setTotal(data.length);
        }
        // Case 3: unexpected response
        else {
          console.error("Unexpected API response:", data);
          setJobs([]);
          setTotal(0);
        }

      } catch (err) {
        console.error("Fetch jobs error:", err.response || err);
        setError("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [page, sort]);

  if (loading) return <div>Loading jobs...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Jobs</h2>
      <p>Total Jobs: {total}</p>

      <div>
        <label>Sort: </label>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {jobs.length === 0 ? (
        <p>No jobs found</p>
      ) : (
        jobs.map((job) => (
          <div key={job.id}>
            <Link to={`/jobs/${job.id}`}>
              <h3>{job.title}</h3>
            </Link>
          </div>
        ))
      )}

      <div style={{ marginTop: "20px" }}>
        {page > 1 && (
          <button onClick={() => setPage(page - 1)}>Prev</button>
        )}

        {page * limit < total && (
          <button onClick={() => setPage(page + 1)}>Next</button>
        )}
      </div>
    </div>
  );
}

export default Jobs;