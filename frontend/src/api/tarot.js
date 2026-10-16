const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("access_token");
}

async function request(url, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(
    `${API_BASE_URL}${url}`,
    {
      ...options,
      headers,
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}


/* =========================================================
   SAVE TAROT READING
   ========================================================= */

export async function saveTarotReading(sessionId) {
  return request(
    `/api/v1/tarot/selection-session/${sessionId}/save`,
    {
      method: "POST",
    }
  );
}


/* =========================================================
   CREATE READING REPORT
   ========================================================= */

export async function createReadingReport(
  readingSessionId
) {
  return request(
    "/api/v1/reading-reports",
    {
      method: "POST",
      body: JSON.stringify({
        reading_session_id: readingSessionId,
      }),
    }
  );
}


/* =========================================================
   GET MY REPORTS
   ========================================================= */

export async function getMyReports() {
  return request(
    "/api/v1/reading-reports"
  );
}


/* =========================================================
   GET SINGLE REPORT
   ========================================================= */

export async function getReport(reportId) {
  return request(
    `/api/v1/reading-reports/${reportId}`
  );
}


/* =========================================================
   CREATE REPORT
   Compatibility alias
   ========================================================= */

export async function createReport(
  readingSessionId
) {
  return createReadingReport(
    readingSessionId
  );
}


/* =========================================================
   DOWNLOAD REPORT PDF
   ========================================================= */

export async function downloadReportPdf(
  reportId
) {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/api/v1/reading-reports/${reportId}/pdf`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data =
      await response.json().catch(() => null);

    throw new Error(
      data?.detail ||
        "Unable to download report."
    );
  }

  const blob = await response.blob();

  const url =
    window.URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    `reading_report_${reportId}.pdf`;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
}