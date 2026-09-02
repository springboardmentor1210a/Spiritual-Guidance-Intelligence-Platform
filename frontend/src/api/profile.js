import apiClient from "./client";


export async function getProfile() {
  const response = await apiClient.get(
    "/profile"
  );

  return response.data;
}


export async function createProfile(profileData) {
  const response = await apiClient.post(
    "/profile",
    profileData
  );

  return response.data;
}


export async function updateProfile(profileData) {
  const response = await apiClient.put(
    "/profile",
    profileData
  );

  return response.data;
}