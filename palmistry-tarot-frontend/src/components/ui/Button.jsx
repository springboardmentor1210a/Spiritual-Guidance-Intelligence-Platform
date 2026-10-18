export default function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
  className = "",
  as = "button",
}) {
  const base =
    "px-5 py-2.5 rounded-card font-medium text-sm transition-colors duration-150 inline-flex items-center justify-center gap-2";

  const variants = {
    primary: "bg-gold text-void hover:bg-goldSoft",
    secondary: "bg-surface text-ink border border-line hover:bg-surfaceHover",
    ghost: "text-ink hover:text-gold",
  };

  const Tag = as;

  return (
    <Tag
      type={as === "button" ? type : undefined}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </Tag>
  );
}