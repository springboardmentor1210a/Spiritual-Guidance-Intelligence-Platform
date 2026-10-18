export default function Card({ children, className = "", hover = false }) {
  return (
    <div
      className={`bg-surface border border-line rounded-card p-6 ${
        hover ? "hover:bg-surfaceHover transition-colors duration-150" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}