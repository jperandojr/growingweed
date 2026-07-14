import { Star } from "lucide-react";

export function StarRating({
  rating,
  reviewCount,
  size = 14,
}: {
  rating: number;
  reviewCount?: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={
              i < Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-neutral-200 text-neutral-200"
            }
          />
        ))}
      </div>
      <span className="text-xs font-medium text-neutral-700">{rating}</span>
      {reviewCount !== undefined && (
        <span className="text-xs text-neutral-400">
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
