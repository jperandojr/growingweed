import fs from "node:fs";
import path from "node:path";
import { Strain } from "@/lib/types";

// The full imported catalog (~34k strains from the strain spreadsheet) is
// stored as JSON and parsed once at runtime. Keeping it out of TypeScript
// source means the compiler and bundler never process a ~22MB literal, and
// it can never leak into a client bundle (this module is server-only).
const file = path.join(process.cwd(), "src", "data", "strains-generated.json");

export const generatedStrains: Strain[] = JSON.parse(fs.readFileSync(file, "utf8"));
