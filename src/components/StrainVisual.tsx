import Image from "next/image";
import { Strain } from "@/lib/types";
import { PlantArt } from "./PlantArt";

/**
 * Strain artwork: renders the strain photo when one exists in /public/strains,
 * otherwise the deterministic gradient placeholder.
 */
export function StrainVisual({
  strain,
  className = "",
  iconClassName = "w-10 h-10",
  sizes = "300px",
}: {
  strain: Pick<Strain, "name" | "image" | "hue">;
  className?: string;
  iconClassName?: string;
  sizes?: string;
}) {
  if (strain.image) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={strain.image}
          alt={`${strain.name} cannabis strain`}
          fill
          sizes={sizes}
          className="object-cover"
        />
      </div>
    );
  }
  return <PlantArt hue={strain.hue} className={className} iconClassName={iconClassName} />;
}
