import {
  Smile,
  Waves,
  Lightbulb,
  Moon,
  Zap,
  Cherry,
  Citrus,
  Fuel,
  Mountain,
  TreePine,
  Candy,
  Flame,
  Cookie,
  Coffee,
  Gauge,
  Clock,
  Home,
  Trees,
  Sprout,
} from "lucide-react";
import { Strain } from "@/lib/types";
import { strainTypes } from "@/lib/strain-utils";

type IconType = React.ComponentType<{ size?: number; className?: string }>;

const effectIcons: Record<string, IconType> = {
  Happy: Smile,
  Relaxed: Waves,
  Creative: Lightbulb,
  Sleepy: Moon,
  Energetic: Zap,
};

const flavorIcons: Record<string, IconType> = {
  Berry: Cherry,
  Lemon: Citrus,
  Diesel: Fuel,
  Earthy: Mountain,
  Pine: TreePine,
  Sweet: Candy,
  Skunk: Flame,
  Citrus: Citrus,
  Chocolate: Cookie,
  Coffee: Coffee,
};

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Deterministic per-strain effect strength: primary effect strongest. */
function effectStrength(strain: Strain, effect: string, index: number) {
  const base = 88 - index * 14; // 88, 74, 60...
  const jitter = hash(strain.slug + effect) % 9; // 0-8
  return Math.min(96, base + jitter);
}

function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {label}
        </span>
        <span className="text-sm font-bold text-neutral-900">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-200/70">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function StrainProfile({ strain }: { strain: Strain }) {
  const types = strainTypes(strain);

  return (
    <aside className="h-fit rounded-2xl border border-neutral-100 bg-neutral-50 p-6">
      <h3 className="text-base font-bold text-neutral-900">Strain Profile</h3>

      {/* Potency */}
      <div className="mt-5 flex flex-col gap-4">
        <Meter value={strain.thc} max={35} label="THC" />
        <Meter value={strain.cbd} max={20} label="CBD" />
      </div>

      {/* Effects */}
      <div className="mt-6 border-t border-neutral-200/70 pt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Effects
        </p>
        <div className="flex flex-col gap-3">
          {strain.effects.map((effect, i) => {
            const Icon = effectIcons[effect] ?? Smile;
            const strength = effectStrength(strain, effect, i);
            return (
              <div key={effect} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-neutral-100">
                  <Icon size={15} className="text-emerald-700" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-sm text-neutral-700">{effect}</span>
                    <span className="text-[11px] text-neutral-400">{strength}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200/70">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${strength}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flavors */}
      <div className="mt-6 border-t border-neutral-200/70 pt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Flavors
        </p>
        <div className="flex flex-wrap gap-2">
          {strain.flavors.map((flavor) => {
            const Icon = flavorIcons[flavor] ?? Candy;
            return (
              <span
                key={flavor}
                className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm ring-1 ring-neutral-100"
              >
                <Icon size={13} className="text-emerald-700" />
                {flavor}
              </span>
            );
          })}
        </div>
      </div>

      {/* Grow facts */}
      <div className="mt-6 border-t border-neutral-200/70 pt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Growing
        </p>
        <dl className="flex flex-col gap-2.5 text-sm">
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-2 text-neutral-500">
              <Gauge size={14} className="text-emerald-700" /> Difficulty
            </dt>
            <dd className="font-medium text-neutral-900">{strain.difficulty}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-2 text-neutral-500">
              <Clock size={14} className="text-emerald-700" /> Flowering
            </dt>
            <dd className="font-medium text-neutral-900">{strain.floweringSpeed}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-2 text-neutral-500">
              {strain.environment.includes("Outdoor") ? (
                <Trees size={14} className="text-emerald-700" />
              ) : (
                <Home size={14} className="text-emerald-700" />
              )}{" "}
              Environment
            </dt>
            <dd className="font-medium text-neutral-900">{strain.environment.join(" / ")}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-2 text-neutral-500">
              <Sprout size={14} className="text-emerald-700" /> Seed Types
            </dt>
            <dd className="font-medium text-neutral-900">{types.join(", ")}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
