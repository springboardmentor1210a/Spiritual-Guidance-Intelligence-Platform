import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("token") || "";
}

export default function ConsultantProfile() {
  const [form, setForm] = useState({
    specialization: "",
    experience_years: "",
    bio: "",
    approach: "",
    availability: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/consultant/profile`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load consultant profile.");
      }

      const data = await response.json();

      setForm({
        specialization: data.specialization || "",
        experience_years:
          data.experience_years === null ||
          data.experience_years === undefined
            ? ""
            : data.experience_years,
        bio: data.bio || "",
        approach: data.approach || "",
        availability: data.availability || "",
      });
    } catch (err) {
      setError(err.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch(`${API_BASE}/api/consultant/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          ...form,
          experience_years:
            form.experience_years === ""
              ? null
              : Number(form.experience_years),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to save profile.");
      }

      setForm({
        specialization: data.specialization || "",
        experience_years:
          data.experience_years === null ||
          data.experience_years === undefined
            ? ""
            : data.experience_years,
        bio: data.bio || "",
        approach: data.approach || "",
        availability: data.availability || "",
      });

      setMessage("Consultant profile updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">Loading consultant profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <style>{`
        .profile-page {
          min-height: 100vh;
          padding: 35px 20px;
          background:
            radial-gradient(circle at top left, rgba(190, 151, 96, .14), transparent 30%),
            linear-gradient(135deg, #f7eee1, #fffaf3, #efe0cd);
          color: #473327;
        }

        .profile-container {
          width: min(900px, 100%);
          margin: 0 auto;
        }

        .profile-header {
          margin-bottom: 25px;
        }

        .profile-back {
          color: #74573f;
          text-decoration: none;
          font-weight: 700;
          display: inline-block;
          margin-bottom: 15px;
        }

        .profile-title {
          margin: 0;
          color: #4c3526;
          font-size: 34px;
        }

        .profile-subtitle {
          color: #816d59;
          margin-top: 8px;
        }

        .profile-card {
          background: rgba(255,252,247,.94);
          border: 1px solid #e1d0bb;
          border-radius: 22px;
          padding: 28px;
          box-shadow: 0 15px 45px rgba(76, 49, 25, .08);
        }

        .profile-form {
          display: grid;
          gap: 20px;
        }

        .profile-field {
          display: grid;
          gap: 8px;
        }

        .profile-field label {
          font-weight: 700;
          color: #5b402d;
        }

        .profile-field input,
        .profile-field textarea,
        .profile-field select {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d9c5ab;
          background: #fffdf9;
          border-radius: 12px;
          padding: 12px 14px;
          font: inherit;
          color: #4c382a;
          outline: none;
        }

        .profile-field textarea {
          min-height: 130px;
          resize: vertical;
        }

        .profile-field input:focus,
        .profile-field textarea:focus {
          border-color: #927052;
          box-shadow: 0 0 0 3px rgba(146,112,82,.12);
        }

        .profile-help {
          color: #917d68;
          font-size: 12px;
        }

        .profile-message {
          padding: 13px 15px;
          border-radius: 12px;
          background: #eaf3e7;
          border: 1px solid #c9ddc2;
          color: #496842;
        }

        .profile-error {
          padding: 13px 15px;
          border-radius: 12px;
          background: #fff0ed;
          border: 1px solid #e6b9b0;
          color: #9b3f34;
        }

        .profile-submit {
          border: 0;
          border-radius: 13px;
          padding: 14px 20px;
          background: #6c4b32;
          color: white;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
        }

        .profile-submit:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .profile-loading {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #705c49;
        }
      `}</style>

      <div className="profile-container">
        <div className="profile-header">
          <Link to="/consultant" className="profile-back">
            ← Back to Consultant Dashboard
          </Link>

          <h1 className="profile-title">Consultant Profile</h1>

          <p className="profile-subtitle">
            Keep your consultant information and approach up to date.
          </p>
        </div>

        <div className="profile-card">
          {message && <div className="profile-message">{message}</div>}
          {error && (
            <div
              className="profile-error"
              style={{ marginTop: message ? 12 : 0 }}
            >
              {error}
            </div>
          )}

          <form
            className="profile-form"
            onSubmit={handleSubmit}
            style={{ marginTop: message || error ? 20 : 0 }}
          >
            <div className="profile-field">
              <label htmlFor="specialization">Specialization</label>

              <input
                id="specialization"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                placeholder="Palmistry, Tarot, Spiritual Guidance..."
                maxLength={160}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="experience_years">
                Experience (years)
              </label>

              <input
                id="experience_years"
                name="experience_years"
                type="number"
                min="0"
                max="100"
                value={form.experience_years}
                onChange={handleChange}
                placeholder="5"
              />
            </div>

            <div className="profile-field">
              <label htmlFor="bio">Professional Bio</label>

              <textarea
                id="bio"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Tell clients about your experience and background..."
                maxLength={5000}
              />

              <div className="profile-help">
                {form.bio.length}/5000 characters
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="approach">Consultation Approach</label>

              <textarea
                id="approach"
                name="approach"
                value={form.approach}
                onChange={handleChange}
                placeholder="Explain how you approach palmistry/tarot consultations..."
                maxLength={5000}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="availability">Availability</label>

              <input
                id="availability"
                name="availability"
                value={form.availability}
                onChange={handleChange}
                placeholder="Mon–Fri, 6 PM–9 PM"
                maxLength={120}
              />
            </div>

            <button
              type="submit"
              className="profile-submit"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Consultant Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}