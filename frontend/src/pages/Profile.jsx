import { useEffect, useState } from "react";

import {
  getProfile,
  createProfile,
  updateProfile,
} from "../api/profile";


function Profile() {
  const [profile, setProfile] = useState(null);

  const [name, setName] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  useEffect(() => {
    loadProfile();
  }, []);


  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProfile();

      setProfile(data);

      setName(data.name || "");
      setAgeGroup(data.age_group || "");
      setProfileImage(data.profile_image || "");

    } catch (error) {

      if (error.response?.status === 404) {
        setProfile(null);
      } else {
        setError(
          error.response?.data?.detail ||
          "Unable to load profile."
        );
      }

    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    const profileData = {
      name: name || null,
      age_group: ageGroup || null,
      profile_image: profileImage || null,
    };


    try {
      let data;

      if (profile) {
        data = await updateProfile(
          profileData
        );
      } else {
        data = await createProfile(
          profileData
        );
      }

      setProfile(data);

      setName(data.name || "");
      setAgeGroup(data.age_group || "");
      setProfileImage(data.profile_image || "");

      setSuccess(
        "Profile saved successfully."
      );

    } catch (error) {

      setError(
        error.response?.data?.detail ||
        "Unable to save profile."
      );

    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div>
        <h1>Profile</h1>
        <p>Loading profile...</p>
      </div>
    );
  }


  return (
    <div>

      <h1>My Profile</h1>

      {error && (
        <p>{error}</p>
      )}

      {success && (
        <p>{success}</p>
      )}


      <form onSubmit={handleSubmit}>

        <div>
          <label>
            Name
          </label>

          <br />

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Enter your name"
          />
        </div>


        <br />


        <div>
          <label>
            Age Group
          </label>

          <br />

          <select
            value={ageGroup}
            onChange={(event) =>
              setAgeGroup(event.target.value)
            }
          >
            <option value="">
              Select age group
            </option>

            <option value="Under 18">
              Under 18
            </option>

            <option value="18-24">
              18-24
            </option>

            <option value="25-34">
              25-34
            </option>

            <option value="35-44">
              35-44
            </option>

            <option value="45-54">
              45-54
            </option>

            <option value="55+">
              55+
            </option>
          </select>
        </div>


        <br />


        <div>
          <label>
            Profile Image URL
          </label>

          <br />

          <input
            type="text"
            value={profileImage}
            onChange={(event) =>
              setProfileImage(event.target.value)
            }
            placeholder="Optional image URL"
          />
        </div>


        <br />


        <button
          type="submit"
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : profile
              ? "Update Profile"
              : "Create Profile"}
        </button>

      </form>

    </div>
  );
}


export default Profile;