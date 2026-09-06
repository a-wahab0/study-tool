"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import ToolHeader from "@/components/ToolHeader";
import CategoryFilter from "@/components/CategoryFilter";
import FaqSection from "@/components/FaqSection";
import { getToolBySlug } from "@/core-lib/tools-registry";
import { recordRecentTool } from "@/core-lib/storage";

const tool = getToolBySlug("unit-converter")!;

type Dimension = "length" | "weight" | "volume";

// Each unit stored as a factor relative to a base unit (meters, grams, liters).
const UNITS: Record<Dimension, Record<string, number>> = {
  length: {
    Millimeters: 0.001,
    Centimeters: 0.01,
    Meters: 1,
    Kilometers: 1000,
    Inches: 0.0254,
    Feet: 0.3048,
    Yards: 0.9144,
    Miles: 1609.34,
  },
  weight: {
    Milligrams: 0.001,
    Grams: 1,
    Kilograms: 1000,
    Ounces: 28.3495,
    Pounds: 453.592,
  },
  volume: {
    Milliliters: 0.001,
    Liters: 1,
    "Cubic meters": 1000,
    Gallons: 3.78541,
    Cups: 0.24,
  },
};

export default function UnitConverterPage() {
  const [dimension, setDimension] = useState<Dimension>("length");
  const [from, setFrom] = useState("Meters");
  const [to, setTo] = useState("Feet");
  const [value, setValue] = useState("1");

  useEffect(() => {
    recordRecentTool(tool.slug);
  }, []);

  useEffect(() => {
    const units = Object.keys(UNITS[dimension]);
    setFrom(units[0]);
    setTo(units[1]);
  }, [dimension]);

  const result = useMemo(() => {
    const num = Number(value);
    if (Number.isNaN(num)) return null;
    const units = UNITS[dimension];
    if (!units[from] || !units[to]) return null;
    return (num * units[from]) / units[to];
  }, [dimension, from, to, value]);

  return (
    <div>
      <ToolHeader title={tool.name} description={tool.description} clientSideOnly={tool.clientSideOnly} />
      <div className="mx-auto max-w-xl px-4 py-6 sm:px-6">
        <CategoryFilter
          options={[
            { value: "length", label: "Length" },
            { value: "weight", label: "Weight" },
            { value: "volume", label: "Volume" },
          ]}
          active={dimension}
          onChange={setDimension}
        />

        <div className="mt-5 grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <div>
            <label className="label" htmlFor="uc-from">
              From
            </label>
            <select id="uc-from" value={from} onChange={(e) => setFrom(e.target.value)} className="input">
              {Object.keys(UNITS[dimension]).map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setFrom(to);
              setTo(from);
            }}
            className="btn-ghost justify-self-center"
            aria-label="Swap units"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
          <div>
            <label className="label" htmlFor="uc-to">
              To
            </label>
            <select id="uc-to" value={to} onChange={(e) => setTo(e.target.value)} className="input">
              {Object.keys(UNITS[dimension]).map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="label" htmlFor="uc-value">
            Value
          </label>
          <input
            id="uc-value"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="input"
          />
        </div>

        <div className="mt-5 rounded-lg border border-ink-200 bg-ink-50 px-4 py-4 text-center">
          <p className="text-2xl font-semibold text-ink-900">
            {result === null ? "—" : result.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </p>
          <p className="text-sm text-ink-500">{to}</p>
        </div>

        <div className="mt-8">
          <FaqSection
            items={[
              {
                question: "Are these conversions precise?",
                answer: "Yes — standard conversion factors are used (e.g. 1 inch = 2.54 cm exactly), rounded to four decimal places for display.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
