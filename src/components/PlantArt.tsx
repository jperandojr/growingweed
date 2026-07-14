import { Leaf } from "lucide-react";

export function PlantArt({
  hue,
  className = "",
  iconClassName = "w-10 h-10",
}: {
  hue: number;
  className?: string;
  iconClassName?: string;
}) {
  const c1 = `hsl(${hue} 45% 16%)`;
  const c2 = `hsl(${(hue + 40) % 360} 55% 28%)`;
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle at 30% 20%, ${c2}, ${c1} 70%)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />
      <Leaf
        className={`${iconClassName} relative text-white/85`}
        strokeWidth={1.25}
      />
    </div>
  );
}
