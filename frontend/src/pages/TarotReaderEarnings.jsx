
import { useMemo, useState } from "react";
import {
  Wallet,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle2,
  CalendarDays,
  Search,
  Download,
  ArrowUpRight,
} from "lucide-react";

const demoPayments = [
  {
    id: "DEMO-1001",
    client: "Sample Client A",
    service: "Tarot Reading",
    date: "2026-10-12",
    amount: 1200,
    status: "Paid",
  },
  {
    id: "DEMO-1002",
    client: "Sample Client B",
    service: "Love & Relationships",
    date: "2026-10-11",
    amount: 900,
    status: "Pending",
  },
  {
    id: "DEMO-1003",
    client: "Sample Client C",
    service: "Career Guidance",
    date: "2026-10-09",
    amount: 1500,
    status: "Paid",
  },
  {
    id: "DEMO-1004",
    client: "Sample Client D",
    service: "General Reading",
    date: "2026-10-07",
    amount: 800,
    status: "Pending",
  },
];

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function TarotReaderEarnings() {
  const [payments] = useState(demoPayments);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const summary = useMemo(() => {
    const paid = payments
      .filter((payment) => payment.status === "Paid")
      .reduce((total, payment) => total + payment.amount, 0);

    const pending = payments
      .filter((payment) => payment.status === "Pending")
      .reduce((total, payment) => total + payment.amount, 0);

    return {
      paid,
      pending,
      total: paid + pending,
      count: payments.length,
    };
  }, [payments]);

  const filteredPayments = payments.filter((payment) => {
    const matchesFilter =
      filter === "All" || payment.status === filter;

    const matchesSearch = [
      payment.id,
      payment.client,
      payment.service,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const exportCsv = () => {
    const headers = [
      "Transaction ID",
      "Client",
      "Service",
      "Date",
      "Amount INR",
      "Status",
    ];

    const rows = filteredPayments.map((payment) => [
      payment.id,
      payment.client,
      payment.service,
      payment.date,
      payment.amount,
      payment.status,
    ]);

    const escapeCsv = (value) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "tarot-reader-payments.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="tr-earnings page-enter">
      <header className="tr-page-heading">
        <div>
          <span className="tr-eyebrow">TAROT READER WORKSPACE</span>
          <h1>Earnings &amp; Payments</h1>
          <p>
            Review consultation revenue and keep track of payment status.
          </p>
        </div>

        <div className="tr-demo-label">
          <span />
          Demo data
        </div>
      </header>

      <section className="tr-stat-grid">
        <article className="tr-stat-card">
          <div className="tr-stat-top">
            <span>Total Revenue</span>
            <span className="tr-stat-icon gold">
              <Wallet size={20} />
            </span>
          </div>
          <strong>{currency(summary.total)}</strong>
          <small>Paid and pending amounts combined</small>
        </article>

        <article className="tr-stat-card">
          <div className="tr-stat-top">
            <span>Received Payments</span>
            <span className="tr-stat-icon green">
              <CheckCircle2 size={20} />
            </span>
          </div>
          <strong>{currency(summary.paid)}</strong>
          <small>Marked as paid in this dataset</small>
        </article>

        <article className="tr-stat-card">
          <div className="tr-stat-top">
            <span>Pending Payments</span>
            <span className="tr-stat-icon purple">
              <Clock size={20} />
            </span>
          </div>
          <strong>{currency(summary.pending)}</strong>
          <small>Awaiting payment confirmation</small>
        </article>

        <article className="tr-stat-card">
          <div className="tr-stat-top">
            <span>Transactions</span>
            <span className="tr-stat-icon blue">
              <IndianRupee size={20} />
            </span>
          </div>
          <strong>{summary.count}</strong>
          <small>Recorded demo transactions</small>
        </article>
      </section>

      <section className="tr-panel">
        <div className="tr-panel-heading">
          <div>
            <h2>Payment History</h2>
            <p>Search and filter consultation transactions.</p>
          </div>

          <button
            className="tr-secondary-button"
            onClick={exportCsv}
            type="button"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        <div className="tr-table-tools">
          <label className="tr-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search transactions..."
              aria-label="Search transactions"
            />
          </label>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter payment status"
          >
            <option value="All">All payments</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="tr-table-wrap">
          <table className="tr-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Client</th>
                <th>Service</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="tr-table-row">
                  <td className="tr-transaction-id">{payment.id}</td>
                  <td>{payment.client}</td>
                  <td>{payment.service}</td>
                  <td>
                    {new Date(
                      payment.date + "T12:00:00"
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="tr-amount">
                    {currency(payment.amount)}
                  </td>
                  <td>
                    <span
                      className={`tr-status ${
                        payment.status === "Paid"
                          ? "is-paid"
                          : "is-pending"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan="6" className="tr-empty">
                    No transactions match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="tr-demo-note">
          <CalendarDays size={15} />
          Example transactions only. Connect your backend payment records
          before using these figures for financial reporting.
        </p>
      </section>
    </main>
  );
}
