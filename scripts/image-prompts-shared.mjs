// Shared prompt definitions used by both the automated generator and the
// manual prompt exporter, so results stay consistent either way.

const STYLE =
  `Studio softbox lighting, clean seamless light-grey background. ` +
  `Photorealistic, commercial e-commerce product photography style, square 1:1 format. ` +
  `No text, no labels, no packaging, no hands, no people.`;

/** Primary shot + 3 angle variations. Filenames: slug.png, slug-2/3/4.png */
export const shots = (name) => [
  {
    suffix: "",
    label: "Primary",
    prompt:
      `Professional product stock photograph of a single dried cannabis flower bud of the "${name}" strain. ` +
      `Ultra-detailed macro, dense bud structure heavily coated in frosty white trichomes, vivid orange pistils. ` +
      `Shallow depth of field. ${STYLE}`,
  },
  {
    suffix: "-2",
    label: "Angle 2 — top-down",
    prompt:
      `Top-down overhead product stock photograph of a single dried cannabis flower bud of the "${name}" strain. ` +
      `Bud viewed directly from above, dense frosty trichomes and orange pistils clearly visible. ${STYLE}`,
  },
  {
    suffix: "-3",
    label: "Angle 3 — side view with loose buds",
    prompt:
      `Side-angle product stock photograph of a large dried cannabis flower bud of the "${name}" strain lying on its side, ` +
      `with two smaller loose buds arranged beside it. Slightly wider composition. ${STYLE}`,
  },
  {
    suffix: "-4",
    label: "Angle 4 — extreme macro detail",
    prompt:
      `Extreme close-up macro photograph of the surface of a dried cannabis flower bud of the "${name}" strain. ` +
      `Glistening crystal trichomes and curling orange pistils fill the frame, shallow depth of field bokeh. ${STYLE}`,
  },
];
