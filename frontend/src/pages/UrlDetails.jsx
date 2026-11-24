import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import "../styles/history.css";

function UrlDetails() {
  const { shortCode } = useParams();

  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUrlDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/urls/${shortCode}/stats`);

        setUrl(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load URL details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUrlDetails();
  }, [shortCode]);

  if (loading) {
    return <div className="details-page">Loading URL details...</div>;
  }

  if (error) {
    return (
      <div className="details-page">
        <h2>{error}</h2>
        <Link to="/history">← Back to History</Link>
      </div>
    );
  }

  return (
    <div className="details-page">
      <div className="history-header">
        <h1>URL Details</h1>
        <p>View information about your shortened link.</p>
      </div>

      <div className="history-card details-card">
        <h2>Short Link Information</h2>

        <p>
          <strong>Original URL:</strong>
        </p>
        <a href={url.originalUrl} target="_blank" rel="noreferrer">
          {url.originalUrl}
        </a>

        <p>
          <strong>Short URL:</strong>
        </p>
        <a href={url.shortUrl} target="_blank" rel="noreferrer">
          {url.shortUrl}
        </a>

        <p>
          <strong>Short Code:</strong> {url.shortCode}
        </p>

        <p>
          <strong>Total Clicks:</strong> {url.clicks}
        </p>

        <p>
          <strong>Created On:</strong>{" "}
          {new Date(url.createdAt).toLocaleDateString("en-IN")}
        </p>

        <p>
          <strong>Expires At:</strong>{" "}
          {url.expiresAt
            ? new Date(url.expiresAt).toLocaleDateString("en-IN")
            : "Never"}
        </p>

        <Link to="/history" className="back-link">
          ← Back to History
        </Link>
      </div>
    </div>
  );
}

export default UrlDetails;
