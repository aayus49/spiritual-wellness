import React from "react";
import { Link } from "react-router-dom";

export default function LinkButton({
  to,
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-2xl " +
    "transition-all duration-200 select-none " +
    "focus:outline-none focus:ring-2 focus:ring-purple-200 " +
    "active:scale-[0.97]";

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  const variants = {
    primary:
      "bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-sm hover:shadow-md",
    secondary:
      "bg-gray-900 text-white hover:bg-gray-800",
    outline:
      "bg-white border border-gray-200 text-gray-900 hover:bg-gray-50",
    ghost:
      "bg-transparent text-gray-700 hover:bg-gray-100",
  };

  return (
    <Link
      to={to}
      className={[
        base,
        sizes[size],
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </Link>
  );
}
