import { PlantArt } from "./PlantArt";

export function PostCover({
  image,
  hue,
  className = "",
  iconClassName = "w-10 h-10",
}: {
  image?: string;
  hue: number;
  className?: string;
  iconClassName?: string;
}) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="" className={`object-cover ${className}`} />;
  }
  return <PlantArt hue={hue} className={className} iconClassName={iconClassName} />;
}
