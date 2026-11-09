export type Unit = {
  id: string;
  name: string;
  symbol: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
};

const linear = (
  id: string,
  name: string,
  symbol: string,
  factor: number,
): Unit => ({
  id,
  name,
  symbol,
  toBase: (v) => v * factor,
  fromBase: (v) => v / factor,
});

export type UnitCategory = {
  id: string;
  label: string;
  units: Unit[];
  defaultFrom: string;
  defaultTo: string;
  allowNegative?: boolean;
};

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: "length",
    label: "Length",
    defaultFrom: "m",
    defaultTo: "ft",
    units: [
      linear("mm", "Millimetre", "mm", 0.001),
      linear("cm", "Centimetre", "cm", 0.01),
      linear("m", "Metre", "m", 1),
      linear("km", "Kilometre", "km", 1000),
      linear("in", "Inch", "in", 0.0254),
      linear("ft", "Foot", "ft", 0.3048),
      linear("yd", "Yard", "yd", 0.9144),
      linear("mi", "Mile", "mi", 1609.344),
      linear("nmi", "Nautical mile", "nmi", 1852),
    ],
  },
  {
    id: "weight",
    label: "Weight",
    defaultFrom: "kg",
    defaultTo: "lb",
    units: [
      linear("mg", "Milligram", "mg", 0.000001),
      linear("g", "Gram", "g", 0.001),
      linear("kg", "Kilogram", "kg", 1),
      linear("t", "Tonne", "t", 1000),
      linear("oz", "Ounce", "oz", 0.028349523125),
      linear("lb", "Pound", "lb", 0.45359237),
      linear("st", "Stone", "st", 6.35029318),
    ],
  },
  {
    id: "temperature",
    label: "Temperature",
    defaultFrom: "c",
    defaultTo: "f",
    allowNegative: true,
    units: [
      {
        id: "c",
        name: "Celsius",
        symbol: "°C",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: "f",
        name: "Fahrenheit",
        symbol: "°F",
        toBase: (v) => ((v - 32) * 5) / 9,
        fromBase: (v) => (v * 9) / 5 + 32,
      },
      {
        id: "k",
        name: "Kelvin",
        symbol: "K",
        toBase: (v) => v - 273.15,
        fromBase: (v) => v + 273.15,
      },
    ],
  },
  {
    id: "area",
    label: "Area",
    defaultFrom: "perch",
    defaultTo: "ft2",
    units: [
      linear("cm2", "Square centimetre", "cm²", 0.0001),
      linear("m2", "Square metre", "m²", 1),
      linear("km2", "Square kilometre", "km²", 1_000_000),
      linear("ft2", "Square foot", "ft²", 0.09290304),
      linear("yd2", "Square yard", "yd²", 0.83612736),
      linear("perch", "Perch", "P", 25.29285264),
      linear("acre", "Acre", "ac", 4046.8564224),
      linear("ha", "Hectare", "ha", 10_000),
      linear("mi2", "Square mile", "mi²", 2_589_988.110336),
    ],
  },
  {
    id: "volume",
    label: "Volume",
    defaultFrom: "l",
    defaultTo: "galus",
    units: [
      linear("ml", "Millilitre", "ml", 0.001),
      linear("l", "Litre", "L", 1),
      linear("m3", "Cubic metre", "m³", 1000),
      linear("tsp", "Teaspoon (US)", "tsp", 0.00492892159375),
      linear("tbsp", "Tablespoon (US)", "tbsp", 0.01478676478125),
      linear("floz", "Fluid ounce (US)", "fl oz", 0.0295735295625),
      linear("cup", "Cup (US)", "cup", 0.2365882365),
      linear("pt", "Pint (US)", "pt", 0.473176473),
      linear("galus", "Gallon (US)", "gal", 3.785411784),
      linear("galuk", "Gallon (UK)", "gal", 4.54609),
    ],
  },
  {
    id: "speed",
    label: "Speed",
    defaultFrom: "kmh",
    defaultTo: "mph",
    units: [
      linear("ms", "Metre per second", "m/s", 1),
      linear("kmh", "Kilometre per hour", "km/h", 1 / 3.6),
      linear("mph", "Mile per hour", "mph", 0.44704),
      linear("kn", "Knot", "kn", 1852 / 3600),
      linear("fts", "Foot per second", "ft/s", 0.3048),
    ],
  },
];

export const CATEGORY_MAP = Object.fromEntries(
  UNIT_CATEGORIES.map((c) => [c.id, c]),
);

export function convert(value: number, from: Unit, to: Unit): number {
  return to.fromBase(from.toBase(value));
}
