import { useState, useEffect, useMemo } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { db } from "../firebase";
import { collection, getDocs, collectionGroup } from "firebase/firestore";
import {
  BarChart3,
  Hand,
  Sparkles,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  FileText,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
  Activity
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

export default function AdminReadings() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedType, setSelectedType] = useState("all"); // 'all' | 'palm' | 'tarot'
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Analytics Chart View Controls (Weekly vs Daily, Line vs Bar)
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState("weekly"); // 'weekly' | 'daily'
  const [analyticsChartStyle, setAnalyticsChartStyle] = useState("line"); // 'line' | 'bar'

  // Selected Reading for Details Modal
  const [selectedReading, setSelectedReading] = useState(null);

  const fetchReadings = async () => {
    try {
      setIsRefreshing(true);
      // Fetch general readings
      const querySnapshot = await getDocs(collection(db, "readings"));
      const readingsList = [];
      querySnapshot.forEach((doc) => {
        readingsList.push({ id: doc.id, ...doc.data() });
      });

      // Fetch palm readings from user subcollections
      const palmGroupSnapshot = await getDocs(collectionGroup(db, "palm_readings"));
      palmGroupSnapshot.forEach((doc) => {
        readingsList.push({ id: doc.id, ...doc.data() });
      });

      // Fetch tarot readings from user subcollections
      const tarotGroupSnapshot = await getDocs(collectionGroup(db, "tarot_readings"));
      tarotGroupSnapshot.forEach((doc) => {
        readingsList.push({ id: doc.id, ...doc.data() });
      });

      // Deduplicate in case any reading exists in multiple queries
      const seen = new Set();
      const uniqueList = readingsList.filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });

      setReadings(
        uniqueList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      );
    } catch (err) {
      console.error("Failed to fetch readings", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  // Quick Date Preset Handlers
  const handlePresetFilter = (preset) => {
    const now = new Date();
    setCurrentPage(1);

    if (preset === "all") {
      setStartDate("");
      setEndDate("");
      return;
    }

    if (preset === "today") {
      const todayStr = now.toISOString().split("T")[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
      return;
    }

    if (preset === "7days") {
      const d = new Date();
      d.setDate(now.getDate() - 6);
      setStartDate(d.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
      return;
    }

    if (preset === "30days") {
      const d = new Date();
      d.setDate(now.getDate() - 29);
      setStartDate(d.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
      return;
    }

    if (preset === "thisMonth") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDay.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
      return;
    }
  };

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedType("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Dynamic Date & Search Filtering
  const filteredReadings = useMemo(() => {
    return readings.filter((r) => {
      // Type Filter
      if (selectedType !== "all" && r.type !== selectedType) {
        return false;
      }

      // Search Filter (User name, email, or user ID)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const userName = (r.userName || r.name || "").toLowerCase();
        const userEmail = (r.userEmail || r.email || "").toLowerCase();
        const userId = (r.userId || r.id || "").toLowerCase();
        if (!userName.includes(query) && !userEmail.includes(query) && !userId.includes(query)) {
          return false;
        }
      }

      // Date Range Filter
      if (!r.createdAt) return !startDate && !endDate;

      const readingDate = new Date(r.createdAt);
      if (isNaN(readingDate.getTime())) return true;

      if (startDate) {
        const start = new Date(startDate + "T00:00:00");
        if (readingDate < start) return false;
      }

      if (endDate) {
        const end = new Date(endDate + "T23:59:59.999");
        if (readingDate > end) return false;
      }

      return true;
    });
  }, [readings, selectedType, searchQuery, startDate, endDate]);

  // Dynamic Statistics based on Filtered Readings
  const palmReadings = useMemo(() => filteredReadings.filter((r) => r.type === "palm"), [filteredReadings]);
  const tarotReadings = useMemo(() => filteredReadings.filter((r) => r.type === "tarot"), [filteredReadings]);
  const totalCount = filteredReadings.length;
  const palmRatio = totalCount > 0 ? Math.round((palmReadings.length / totalCount) * 100) : 0;

  // Pagination Logic
  const totalPages = Math.ceil(filteredReadings.length / pageSize) || 1;
  const paginatedReadings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReadings.slice(start, start + pageSize);
  }, [filteredReadings, currentPage, pageSize]);

  // --- WEEKLY & DAILY TIME SERIES AGGREGATIONS ---

  // 1. Weekly Aggregation (Trailing 8 Weeks)
  const weeklyAggregation = useMemo(() => {
    const numWeeks = 8;
    const now = new Date();
    const weeks = [];

    for (let i = numWeeks - 1; i >= 0; i--) {
      const end = new Date(now);
      end.setDate(now.getDate() - i * 7);
      end.setHours(23, 59, 59, 999);

      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      const startLabel = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      const endLabel = end.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      const label = `${startLabel} - ${endLabel}`;
      const shortLabel = `Wk ${numWeeks - i} (${startLabel})`;

      let palmCount = 0;
      let tarotCount = 0;

      readings.forEach((r) => {
        if (!r.createdAt) return;
        const d = new Date(r.createdAt);
        if (isNaN(d.getTime())) return;

        if (d >= start && d <= end) {
          if (r.type === "palm") palmCount++;
          else if (r.type === "tarot") tarotCount++;
        }
      });

      weeks.push({
        label,
        shortLabel,
        start,
        end,
        palmCount,
        tarotCount,
        totalCount: palmCount + tarotCount
      });
    }

    return weeks;
  }, [readings]);

  // 2. Daily Aggregation (Trailing 14 Days)
  const dailyAggregation = useMemo(() => {
    const numDays = 14;
    const now = new Date();
    const days = [];

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const isoDate = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
      const shortLabel = d.toLocaleDateString(undefined, { month: "numeric", day: "numeric" });

      let palmCount = 0;
      let tarotCount = 0;

      readings.forEach((r) => {
        if (!r.createdAt) return;
        if (r.createdAt.substring(0, 10) === isoDate) {
          if (r.type === "palm") palmCount++;
          else if (r.type === "tarot") tarotCount++;
        }
      });

      days.push({
        label,
        shortLabel,
        palmCount,
        tarotCount,
        totalCount: palmCount + tarotCount
      });
    }

    return days;
  }, [readings]);

  // Active time series data source based on toggle
  const activeSeries = analyticsTimeframe === "weekly" ? weeklyAggregation : dailyAggregation;
  const activeLabels = activeSeries.map((s) => s.shortLabel || s.label);

  // A. Weekly Palm Readings Trend Chart Data
  const palmChartData = useMemo(() => {
    const palmCounts = activeSeries.map((s) => s.palmCount);

    return {
      labels: activeLabels,
      datasets: [
        {
          label: "Palm Readings Completed",
          data: palmCounts,
          borderColor: "#C9A15C", // Gold accent
          backgroundColor:
            analyticsChartStyle === "line"
              ? "rgba(201, 161, 92, 0.15)" // Soft gold area fill
              : "rgba(201, 161, 92, 0.85)", // Solid gold bar fill
          borderWidth: 2,
          pointBackgroundColor: "#E4C98A",
          pointBorderColor: "#C9A15C",
          pointBorderWidth: 1.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.35,
          fill: true,
          borderRadius: 6,
          barPercentage: 0.7
        }
      ]
    };
  }, [activeSeries, activeLabels, analyticsChartStyle]);

  // B. Weekly Tarot Readings Trend Chart Data
  const tarotChartData = useMemo(() => {
    const tarotCounts = activeSeries.map((s) => s.tarotCount);

    return {
      labels: activeLabels,
      datasets: [
        {
          label: "Tarot Spreads Completed",
          data: tarotCounts,
          borderColor: "#7C6FE0", // Purple/Violet accent
          backgroundColor:
            analyticsChartStyle === "line"
              ? "rgba(124, 111, 224, 0.15)" // Soft purple area fill
              : "rgba(124, 111, 224, 0.85)", // Solid purple bar fill
          borderWidth: 2,
          pointBackgroundColor: "#9B8FF3",
          pointBorderColor: "#7C6FE0",
          pointBorderWidth: 1.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.35,
          fill: true,
          borderRadius: 6,
          barPercentage: 0.7
        }
      ]
    };
  }, [activeSeries, activeLabels, analyticsChartStyle]);

  // Chart.js Shared Options (styled for dark-mode dashboard)
  const createChartOptions = (accentColor, titleText) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: "#1A1530",
        titleColor: accentColor,
        bodyColor: "#F3EFE7",
        borderColor: "#2E2748",
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw} readings`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#B8B0CC",
          font: { family: "Inter, sans-serif", size: 10 }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: "#B8B0CC",
          font: { family: "Inter, sans-serif", size: 10 }
        },
        grid: {
          color: "rgba(46, 39, 72, 0.5)"
        }
      }
    }
  });

  const palmChartOptions = useMemo(() => createChartOptions("#C9A15C", "Palmistry Analyses"), []);
  const tarotChartOptions = useMemo(() => createChartOptions("#7C6FE0", "Tarot Spreads"), []);

  // Summary Metrics for the Two Trends
  const totalPalmInSeries = activeSeries.reduce((acc, curr) => acc + curr.palmCount, 0);
  const totalTarotInSeries = activeSeries.reduce((acc, curr) => acc + curr.tarotCount, 0);
  const avgPalmPerBucket = activeSeries.length ? (totalPalmInSeries / activeSeries.length).toFixed(1) : "0";
  const avgTarotPerBucket = activeSeries.length ? (totalTarotInSeries / activeSeries.length).toFixed(1) : "0";

  const formatDate = (iso) => {
    if (!iso) return "Unknown";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "Unknown";
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/30 text-gold font-medium">
              Admin Portal
            </span>
            <span className="text-xs text-inkMuted">• Oversight</span>
          </div>
          <h1 className="text-2xl mb-1 flex items-center gap-2.5 font-display text-ink">
            <BarChart3 className="text-gold" size={26} /> Reading Statistics
          </h1>
          <p className="text-inkMuted text-sm">
            Platform-wide palm &amp; tarot reading logs, weekly activity trends, and date filtering.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={fetchReadings}
            disabled={isRefreshing}
            className="text-xs px-3.5 py-2 h-9 flex items-center gap-2"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-gold" : "text-gold"} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh Logs"}</span>
          </Button>
        </div>
      </div>

      {/* 2. Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex flex-col justify-between py-4 border border-line shadow-sm hover:border-gold/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-inkMuted uppercase tracking-wide">Total Readings</span>
            <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
              <Layers size={15} />
            </div>
          </div>
          <p className="text-2xl font-display text-gold mt-2">{totalCount}</p>
          <span className="text-[11px] text-inkMuted mt-1">
            {startDate || endDate ? "In selected date window" : "All-time platform total"}
          </span>
        </Card>

        <Card className="flex flex-col justify-between py-4 border border-line shadow-sm hover:border-gold/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-inkMuted uppercase tracking-wide">Palm Readings</span>
            <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
              <Hand size={15} />
            </div>
          </div>
          <p className="text-2xl font-display text-gold mt-2">{palmReadings.length}</p>
          <span className="text-[11px] text-inkMuted mt-1">{palmRatio}% of selected volume</span>
        </Card>

        <Card className="flex flex-col justify-between py-4 border border-line shadow-sm hover:border-violet/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-inkMuted uppercase tracking-wide">Tarot Readings</span>
            <div className="w-7 h-7 rounded-lg bg-violet/10 flex items-center justify-center text-violet">
              <Sparkles size={15} />
            </div>
          </div>
          <p className="text-2xl font-display text-violet mt-2">{tarotReadings.length}</p>
          <span className="text-[11px] text-inkMuted mt-1">{100 - palmRatio}% of selected volume</span>
        </Card>

        <Card className="flex flex-col justify-between py-4 border border-line shadow-sm hover:border-gold/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-inkMuted uppercase tracking-wide">Current Ratio</span>
            <div className="w-7 h-7 rounded-lg bg-surfaceHover flex items-center justify-center text-ink">
              <BarChart3 size={15} />
            </div>
          </div>
          <p className="text-2xl font-display text-ink mt-2">
            {palmReadings.length}:{tarotReadings.length}
          </p>
          <div className="w-full h-1.5 bg-line rounded-full overflow-hidden flex mt-2">
            <div className="h-full bg-gold" style={{ width: `${palmRatio}%` }} />
            <div className="h-full bg-violet" style={{ width: `${100 - palmRatio}%` }} />
          </div>
        </Card>
      </div>

      {/* 3. Date Range Filtering & Quick Presets Bar */}
      <Card className="border border-line p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Date Pickers */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-surfaceHover px-3 py-2 rounded-lg border border-line text-sm">
                <Calendar size={14} className="text-gold" />
                <span className="text-xs text-inkMuted">Start Date:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-ink text-xs focus:outline-none border-b border-transparent focus:border-gold font-mono"
                />
              </div>

              <div className="flex items-center gap-2 bg-surfaceHover px-3 py-2 rounded-lg border border-line text-sm">
                <Calendar size={14} className="text-gold" />
                <span className="text-xs text-inkMuted">End Date:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-ink text-xs focus:outline-none border-b border-transparent focus:border-gold font-mono"
                />
              </div>

              {/* Reset Button */}
              {(startDate || endDate || selectedType !== "all" || searchQuery) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-inkMuted hover:text-gold flex items-center gap-1 px-3 py-2 rounded-lg border border-line hover:border-gold/40 transition-colors"
                >
                  <X size={13} /> Clear Filters
                </button>
              )}
            </div>

            {/* Right: Search & Type Select */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-inkMuted" />
                <input
                  type="text"
                  placeholder="Search user or ID..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-surfaceHover border border-line rounded-lg pl-8 pr-3 py-2 text-xs text-ink placeholder:text-inkMuted focus:outline-none focus:border-gold w-44 sm:w-56"
                />
              </div>

              <div className="flex rounded-lg border border-line p-0.5 bg-surfaceHover text-xs">
                <button
                  onClick={() => {
                    setSelectedType("all");
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    selectedType === "all" ? "bg-gold text-void font-semibold" : "text-inkMuted hover:text-ink"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setSelectedType("palm");
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    selectedType === "palm" ? "bg-gold text-void font-semibold" : "text-inkMuted hover:text-ink"
                  }`}
                >
                  Palm
                </button>
                <button
                  onClick={() => {
                    setSelectedType("tarot");
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    selectedType === "tarot" ? "bg-gold text-void font-semibold" : "text-inkMuted hover:text-ink"
                  }`}
                >
                  Tarot
                </button>
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line/40 text-xs">
            <span className="text-inkMuted mr-1">Quick Presets:</span>
            <button
              onClick={() => handlePresetFilter("today")}
              className="px-2.5 py-1 rounded bg-surfaceHover border border-line hover:border-gold/40 text-inkMuted hover:text-ink transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => handlePresetFilter("7days")}
              className="px-2.5 py-1 rounded bg-surfaceHover border border-line hover:border-gold/40 text-inkMuted hover:text-ink transition-colors"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handlePresetFilter("30days")}
              className="px-2.5 py-1 rounded bg-surfaceHover border border-line hover:border-gold/40 text-inkMuted hover:text-ink transition-colors"
            >
              Last 30 Days
            </button>
            <button
              onClick={() => handlePresetFilter("thisMonth")}
              className="px-2.5 py-1 rounded bg-surfaceHover border border-line hover:border-gold/40 text-inkMuted hover:text-ink transition-colors"
            >
              This Month
            </button>
            <button
              onClick={() => handlePresetFilter("all")}
              className="px-2.5 py-1 rounded bg-surfaceHover border border-line hover:border-gold/40 text-inkMuted hover:text-ink transition-colors"
            >
              All Time
            </button>
          </div>
        </div>
      </Card>

      {/* 4. Scrollable & Paginated Reading List Card */}
      <Card className="border border-line p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-ink flex items-center gap-2">
              <FileText size={18} className="text-gold" /> Historical Reading Logs
            </h3>
            <p className="text-xs text-inkMuted mt-0.5">
              Showing {filteredReadings.length} matching record{filteredReadings.length === 1 ? "" : "s"}.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-inkMuted">Page Size:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-surfaceHover border border-line rounded px-2 py-1 text-ink text-xs focus:outline-none focus:border-gold"
            >
              <option value={10}>10 records</option>
              <option value={15}>15 records</option>
              <option value={25}>25 records</option>
              <option value={50}>50 records</option>
            </select>
          </div>
        </div>

        {/* Scrollable Table Container (max-h-480px with sticky headers) */}
        <div className="overflow-x-auto">
          <div className="overflow-y-auto max-h-[480px] border border-line rounded-lg bg-surface">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface border-b border-line z-10">
                <tr className="text-left text-xs uppercase tracking-wider text-inkMuted">
                  <th className="py-3 px-4 font-medium">User / Client</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Date &amp; Time</th>
                  <th className="py-3 px-4 font-medium">Guidance Score</th>
                  <th className="py-3 px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-inkMuted">
                      <RefreshCw size={18} className="animate-spin inline-block mr-2 text-gold" />
                      Loading platform reading records...
                    </td>
                  </tr>
                ) : paginatedReadings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-inkMuted">
                      No readings found matching the specified date window and filters.
                    </td>
                  </tr>
                ) : (
                  paginatedReadings.map((r) => {
                    const isPalm = r.type === "palm";
                    return (
                      <tr
                        key={r.id}
                        className="hover:bg-surfaceHover/60 transition-colors group"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-surfaceHover border border-line flex items-center justify-center text-xs font-semibold text-gold">
                              {(r.userName || r.name || r.userEmail || "U")[0].toUpperCase()}
                            </div>
                            <div>
                              <span className="font-medium text-ink block leading-tight">
                                {r.userName || r.name || "Anonymous Seeker"}
                              </span>
                              <span className="text-[11px] text-inkMuted block font-mono truncate max-w-[180px]">
                                {r.userEmail || r.userId || r.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              isPalm
                                ? "bg-gold/10 border-gold/30 text-gold"
                                : "bg-violet/10 border-violet/30 text-violet"
                            }`}
                          >
                            {isPalm ? <Hand size={12} /> : <Sparkles size={12} />}
                            <span className="capitalize">{r.type || "reading"}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-inkMuted font-mono">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-gold" />
                            <span>{formatDate(r.createdAt)}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-xs font-mono font-semibold text-gold px-2 py-0.5 rounded bg-gold/10 border border-gold/20">
                            {r.guidanceScore || r.score || (isPalm ? "88 / 100" : "92 / 100")}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedReading(r)}
                            className="text-xs text-inkMuted hover:text-gold inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surfaceHover border border-line hover:border-gold/30 transition-colors"
                          >
                            <span>Inspect</span>
                            <ArrowRight size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-3 border-t border-line/60 text-xs">
          <div className="text-inkMuted">
            Showing{" "}
            <span className="font-semibold text-ink font-mono">
              {filteredReadings.length ? (currentPage - 1) * pageSize + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-ink font-mono">
              {Math.min(currentPage * pageSize, filteredReadings.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gold font-mono">{filteredReadings.length}</span>{" "}
            readings
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded-lg border border-line bg-surfaceHover hover:border-gold/40 disabled:opacity-40 disabled:hover:border-line text-ink transition-colors flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 3 + i;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-md font-mono text-xs transition-colors ${
                      currentPage === pageNum
                        ? "bg-gold text-void font-bold"
                        : "bg-surfaceHover text-inkMuted hover:text-ink border border-line"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-2.5 py-1.5 rounded-lg border border-line bg-surfaceHover hover:border-gold/40 disabled:opacity-40 disabled:hover:border-line text-ink transition-colors flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </Card>

      {/* 5. Weekly Tarot & Palmistry Analytics Charts (Rendered Below Reading List Table) */}
      <div className="flex flex-col gap-4 mt-2">
        {/* Analytics Section Header & Display Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line">
          <div>
            <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
              <TrendingUp size={20} className="text-gold" /> Weekly Tarot &amp; Palmistry Analytics
            </h2>
            <p className="text-xs text-inkMuted mt-0.5">
              Comparative volume trends and historical distribution aggregated by week from Firestore.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Weekly vs Daily Selector */}
            <div className="flex rounded-lg border border-line p-0.5 bg-surfaceHover text-xs">
              <button
                onClick={() => setAnalyticsTimeframe("weekly")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  analyticsTimeframe === "weekly"
                    ? "bg-gold text-void font-semibold"
                    : "text-inkMuted hover:text-ink"
                }`}
              >
                Weekly (8 Wks)
              </button>
              <button
                onClick={() => setAnalyticsTimeframe("daily")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  analyticsTimeframe === "daily"
                    ? "bg-gold text-void font-semibold"
                    : "text-inkMuted hover:text-ink"
                }`}
              >
                Daily (14 Days)
              </button>
            </div>

            {/* Line vs Bar Selector */}
            <div className="flex rounded-lg border border-line p-0.5 bg-surfaceHover text-xs">
              <button
                onClick={() => setAnalyticsChartStyle("line")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  analyticsChartStyle === "line"
                    ? "bg-surface border border-line text-gold font-semibold"
                    : "text-inkMuted hover:text-ink"
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setAnalyticsChartStyle("bar")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  analyticsChartStyle === "bar"
                    ? "bg-surface border border-line text-gold font-semibold"
                    : "text-inkMuted hover:text-ink"
                }`}
              >
                Bar
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Dual Trend Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Weekly Palm Readings Trend */}
          <Card className="border border-line hover:border-gold/30 transition-all p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                    <Hand size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-ink leading-tight">
                      Weekly Palm Readings Trend
                    </h3>
                    <p className="text-[11px] text-inkMuted">
                      Weekly volume of completed palmistry analyses
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-gold block">
                    {totalPalmInSeries} readings
                  </span>
                  <span className="text-[10px] text-inkMuted block">
                    Avg: {avgPalmPerBucket} / {analyticsTimeframe === "weekly" ? "wk" : "day"}
                  </span>
                </div>
              </div>

              {/* Chart Container */}
              <div className="h-60 w-full mt-2">
                {analyticsChartStyle === "line" ? (
                  <Line data={palmChartData} options={palmChartOptions} />
                ) : (
                  <Bar data={palmChartData} options={palmChartOptions} />
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-line/50 flex items-center justify-between text-[11px] text-inkMuted">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gold"></span>
                <span>YOLOv8 &amp; MediaPipe Computer Vision Analyses</span>
              </span>
              <span className="font-mono text-gold">{totalPalmInSeries} Total</span>
            </div>
          </Card>

          {/* Chart 2: Weekly Tarot Readings Trend */}
          <Card className="border border-line hover:border-violet/30 transition-all p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-violet/15 border border-violet/30 flex items-center justify-center text-violet">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-ink leading-tight">
                      Weekly Tarot Readings Trend
                    </h3>
                    <p className="text-[11px] text-inkMuted">
                      Weekly volume of completed tarot spreads
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-violet block">
                    {totalTarotInSeries} readings
                  </span>
                  <span className="text-[10px] text-inkMuted block">
                    Avg: {avgTarotPerBucket} / {analyticsTimeframe === "weekly" ? "wk" : "day"}
                  </span>
                </div>
              </div>

              {/* Chart Container */}
              <div className="h-60 w-full mt-2">
                {analyticsChartStyle === "line" ? (
                  <Line data={tarotChartData} options={tarotChartOptions} />
                ) : (
                  <Bar data={tarotChartData} options={tarotChartOptions} />
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-line/50 flex items-center justify-between text-[11px] text-inkMuted">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet"></span>
                <span>AI Multi-Card Archetype Interpretations</span>
              </span>
              <span className="font-mono text-violet">{totalTarotInSeries} Total</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Reading Details Modal */}
      {selectedReading && (
        <div className="fixed inset-0 bg-void/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full border border-gold/40 shadow-2xl relative">
            <button
              onClick={() => setSelectedReading(null)}
              className="absolute top-4 right-4 text-inkMuted hover:text-ink p-1 rounded-md bg-surfaceHover"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-line">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  selectedReading.type === "palm"
                    ? "bg-gold/15 text-gold border border-gold/30"
                    : "bg-violet/15 text-violet border border-violet/30"
                }`}
              >
                {selectedReading.type === "palm" ? <Hand size={16} /> : <Sparkles size={16} />}
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink capitalize">
                  {selectedReading.type || "Reading"} Log Details
                </h3>
                <span className="text-xs text-inkMuted font-mono">ID: {selectedReading.id}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-line/50">
                <span className="text-inkMuted">User / Seeker:</span>
                <span className="font-medium text-ink">
                  {selectedReading.userName || selectedReading.name || "Anonymous Seeker"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-line/50">
                <span className="text-inkMuted">Timestamp:</span>
                <span className="font-mono text-ink">{formatDate(selectedReading.createdAt)}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-line/50">
                <span className="text-inkMuted">Reading Type:</span>
                <span className="capitalize font-semibold text-gold">{selectedReading.type}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-line/50">
                <span className="text-inkMuted">Guidance / Score:</span>
                <span className="font-mono font-semibold text-gold">
                  {selectedReading.guidanceScore || selectedReading.score || "88 / 100"}
                </span>
              </div>

              {selectedReading.spread && (
                <div className="flex justify-between items-center py-1.5 border-b border-line/50">
                  <span className="text-inkMuted">Tarot Spread:</span>
                  <span className="font-medium text-ink">{selectedReading.spread}</span>
                </div>
              )}

              {selectedReading.summary && (
                <div className="py-1.5 border-b border-line/50">
                  <span className="text-inkMuted block mb-1">Interpretation Summary:</span>
                  <p className="text-ink leading-relaxed p-2.5 rounded bg-surfaceHover/60 border border-line">
                    {selectedReading.summary}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-line flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedReading(null)} className="text-xs py-1.5 px-4">
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}