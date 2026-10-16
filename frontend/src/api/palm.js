const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("access_token");
}

export async function analyzePalm(file) {
  const token = getToken();

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/palm/analyze`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        "Unable to analyze palm image."
    );
  }

  return data;
}