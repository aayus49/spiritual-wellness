import React from "react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  className = "",
  ...props
}) {
  const isDisabled = disabled || loading;

  const base =
    "inline-flex items-center justify-center font-semibold rounded-2xl " +
    "transition-all duration-200 select-none " +
    "focus:outline-none focus:ring-2 focus:ring-purple-200 " +
    "active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed";

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  const variants = {
    primary:
      "bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-md hover:shadow-lg",
    outline:
      "bg-white/10 border border-white/20 text-white hover:bg-white/15",
    danger:
      "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={[
        base,
        sizes[size],
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          Loading
        </span>
      ) : (
        children
      )}
    </button>
  );
}
