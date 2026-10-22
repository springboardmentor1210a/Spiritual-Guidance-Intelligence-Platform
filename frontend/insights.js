const API_URL = "http://127.0.0.1:8000";
const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

let charts = {};

async function fetchAPI(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
}

function showValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value ?? "—";
    }
}

function createChart(canvasId, type, labels, values, label) {
    const canvas = document.getElementById(canvasId);

    if (!canvas || typeof Chart === "undefined") return;

    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }

    charts[canvasId] = new Chart(canvas, {
        type,
        data: {
            labels,
            datasets: [{
                label,
                data: values,
                borderWidth: 2,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: type === "doughnut" }
            }
        }
    });
}

async function loadExecutiveDashboard() {
    try {
        const [reports, guidance] = await Promise.allSettled([
            fetchAPI("/reports"),
            fetch(`${API_URL}/personalized-guidance/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? {
                        Authorization: `Bearer ${token}`
                    } : {})
                },
                body: JSON.stringify({})
            }).then(async response => {
                if (!response.ok) {
                    throw new Error("Guidance API request failed");
                }
                return response.json();
            })
        ]);

        if (reports.status === "fulfilled") {
            const reportData = Array.isArray(reports.value)
                ? reports.value
                : reports.value.reports || [];

            showValue("totalReports", reportData.length);

            createChart(
                "reportsChart",
                "bar",
                ["Reports"],
                [reportData.length],
                "Generated reports"
            );
        } else {
            console.warn("Could not load reports:", reports.reason);
        }

        if (guidance.status === "fulfilled") {
            window.executiveGuidance = guidance.value;
            console.log("Personalized guidance loaded.");
        } else {
            console.warn(
                "Could not load personalized guidance:",
                guidance.reason
            );
        }
    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadExecutiveDashboard();
});