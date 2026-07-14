import { Leaf } from "lucide-react";

/**
 * GrowingWeed wordmark: "GROWING" in charcoal, "WEED" in brand green, with a
 * leaf perched over the W. Pure text/SVG, so it stays crisp at any size.
 * `variant="dark"` renders the charcoal part in white for dark backgrounds.
 * Font size is inherited — set text-* on the parent or via className.
 */
export function Logo({
  variant = "light",
  className = "",
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      className={`relative inline-block whitespace-nowrap font-extrabold uppercase leading-none tracking-tight ${className}`}
    >
      <Leaf
        aria-hidden
        className="absolute -top-[0.5em] left-[31%] h-[0.8em] w-[0.8em] -translate-x-1/2 fill-[#5f9548]/25 text-[#4e8039]"
        strokeWidth={2.2}
      />
      <span className={variant === "dark" ? "text-white" : "text-neutral-700"}>Growing</span>
      <span className="text-[#5f9548]">Weed</span>
    </span>
  );
}
