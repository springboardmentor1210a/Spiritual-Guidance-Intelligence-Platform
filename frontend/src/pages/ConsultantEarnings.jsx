
import { IndianRupee, CreditCard, Clock, Info } from "lucide-react";

const DEMO_PAYMENTS = [
  {
    id: "PAY-1001",
    client: "Ananya S.",
    service: "Tarot Reading",
    amount: 1200,
    status: "Paid",
    date: "12 Oct 2026",
  },
  {
    id: "PAY-1002",
    client: "Rohan K.",
    service: "Spiritual Guidance",
    amount: 1500,
    status: "Paid",
    date: "13 Oct 2026",
  },
  {
    id: "PAY-1003",
    client: "Meera R.",
    service: "Birth Chart Reading",
    amount: 1000,
    status: "Pending",
    date: "14 Oct 2026",
  },
  {
    id: "PAY-1004",
    client: "Arjun P.",
    service: "Tarot Reading",
    amount: 1200,
    status: "Paid",
    date: "14 Oct 2026",
  },
  {
    id: "PAY-1005",
    client: "Kavya M.",
    service: "Spiritual Guidance",
    amount: 1500,
    status: "Refunded",
    date: "10 Oct 2026",
  },
];

const DEMO_MONTHLY_EARNINGS = [
  { month: "May", amount: 18000 },
  { month: "Jun", amount: 22500 },
  { month: "Jul", amount: 26400 },
  { month: "Aug", amount: 31200 },
  { month: "Sep", amount: 34800 },
  { month: "Oct", amount: 42000 },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function ConsultantEarnings() {
  const paidPayments = DEMO_PAYMENTS.filter(
    (payment) => payment.status === "Paid"
  );

  const pendingPayments = DEMO_PAYMENTS.filter(
    (payment) => payment.status === "Pending"
  );

  const refundedPayments = DEMO_PAYMENTS.filter(
    (payment) => payment.status === "Refunded"
  );

  const totalEarnings = paidPayments.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  const pendingAmount = pendingPayments.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  const refundedAmount = refundedPayments.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  const stats = [
    {
      title: "Total Earnings",
      value: formatCurrency(totalEarnings),
      subtitle: "From paid demo transactions",
      icon: IndianRupee,
    },
    {
      title: "Completed Payments",
      value: paidPayments.length,
      subtitle: formatCurrency(totalEarnings) + " received",
      icon: CreditCard,
    },
    {
      title: "Pending Payments",
      value: formatCurrency(pendingAmount),
      subtitle: `${pendingPayments.length} payment awaiting completion`,
      icon: Clock,
    },
    {
      title: "Refunded Amount",
      value: formatCurrency(refundedAmount),
      subtitle: `${refundedPayments.length} refunded transaction`,
      icon: Info,
    },
  ];

  const maxMonthlyEarnings = Math.max(
    ...DEMO_MONTHLY_EARNINGS.map((item) => item.amount)
  );

  return (
    <main className="consultant-page consultant-page-animated">
      <header className="consultant-page-header">
        <div>
          <p className="consultant-eyebrow">FINANCIAL OVERVIEW</p>
          <h1>Earnings &amp; Payments</h1>
          <p>
            Review your consultation revenue and payment history.
          </p>
        </div>
      </header>

      <div
        className="consultant-demo-notice"
        role="note"
        style={{
          marginBottom: 20,
          padding: "12px 16px",
          border: "1px solid rgba(185,154,104,0.3)",
          borderRadius: 10,
          background: "rgba(185,154,104,0.08)",
          color: "#d9c49d",
          fontSize: 13,
        }}
      >

      </div>

      <section className="consultant-stat-grid">
        {stats.map(({ title, value, subtitle, icon: Icon }) => (
          <article className="consultant-stat-card" key={title}>
            <div className="consultant-stat-icon">
              <Icon size={21} />
            </div>
            <p>{title}</p>
            <h2>{value}</h2>
            <span>{subtitle}</span>
          </article>
        ))}
      </section>

      <section className="consultant-panel">
        <h2>Monthly Earnings</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(75px, 1fr))",
            gap: 16,
            alignItems: "end",
            minHeight: 190,
            padding: "20px 4px",
          }}
        >
          {DEMO_MONTHLY_EARNINGS.map((item) => (
            <div
              key={item.month}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                minWidth: 0,
              }}
            >
              <span
                style={{
                  color: "#d9c49d",
                  fontSize: 11,
                  textAlign: "center",
                }}
              >
                ₹{(item.amount / 1000).toFixed(1)}k
              </span>

              <div
                title={`${item.month}: ${formatCurrency(item.amount)}`}
                style={{
                  width: "100%",
                  maxWidth: 44,
                  height: `${Math.max(
                    12,
                    (item.amount / maxMonthlyEarnings) * 125
                  )}px`,
                  borderRadius: "7px 7px 2px 2px",
                  background:
                    "linear-gradient(180deg, #b99a68, #8b76d8)",
                  boxShadow: "0 4px 14px rgba(139,118,216,0.16)",
                }}
              />

              <span style={{ color: "#aaa7bd", fontSize: 12 }}>
                {item.month}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="consultant-panel">
        <h2>Payment History</h2>

        <div style={{ width: "100%", overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 680,
              textAlign: "left",
            }}
          >
            <thead>
              <tr>
                {[
                  "Transaction",
                  "Client",
                  "Service",
                  "Date",
                  "Amount",
                  "Status",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding: "14px 12px",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      color: "#b99a68",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {DEMO_PAYMENTS.map((payment) => {
                const statusColors = {
                  Paid: {
                    color: "#75d2a4",
                    background: "rgba(103,184,148,0.12)",
                  },
                  Pending: {
                    color: "#e5c58c",
                    background: "rgba(185,154,104,0.12)",
                  },
                  Refunded: {
                    color: "#e49aa5",
                    background: "rgba(215,108,121,0.12)",
                  },
                };

                const badgeStyle = statusColors[payment.status];

                return (
                  <tr key={payment.id}>
                    <td style={cellStyle}>{payment.id}</td>
                    <td style={cellStyle}>{payment.client}</td>
                    <td style={cellStyle}>{payment.service}</td>
                    <td style={cellStyle}>{payment.date}</td>
                    <td style={{ ...cellStyle, color: "#e4c48b" }}>
                      {formatCurrency(payment.amount)}
                    </td>
                    <td style={cellStyle}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "5px 10px",
                          borderRadius: 20,
                          color: badgeStyle.color,
                          background: badgeStyle.background,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

const cellStyle = {
  padding: "14px 12px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  color: "#d0ccdf",
  fontSize: 13,
  whiteSpace: "nowrap",
};
