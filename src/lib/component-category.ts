/**
 * LCSC-style component families for salvage BOM lines (heuristic, no API calls).
 */

export const COMPONENT_CATEGORIES = [
  "Resistors",
  "Capacitors",
  "Inductors & magnetics",
  "Ferrite beads",
  "LEDs",
  "Diodes",
  "Transistors",
  "ICs & MCUs",
  "Connectors",
  "Switches",
  "Crystals & oscillators",
  "Fuses & protection",
  "Mechanical / hardware",
  "Other",
] as const;

type CatInput = {
  footprint?: string | null;
  comment?: string | null;
  mpn?: string | null;
  description?: string | null;
  designator?: string | null;
};

export function inferComponentCategory(input: CatInput): string {
  const fp = (input.footprint ?? "").toLowerCase();
  const c = (input.comment ?? "").toLowerCase();
  const mpn = (input.mpn ?? "").toLowerCase();
  const desc = (input.description ?? "").toLowerCase();
  const des = (input.designator ?? "").trim();
  const desU = des.toUpperCase();
  const blob = `${fp} ${c} ${mpn} ${desc}`;

  if (
    /\b(usb|type-c|xh\d|connector|conn-|header|socket|jack|plug|terminal block)\b/i.test(
      blob
    ) ||
    fp.includes("conn") ||
    fp.includes("usb-")
  ) {
    return "Connectors";
  }

  if (
    /\b(sw-|switch|tact|button|slide|rotary)\b/i.test(blob) ||
    fp.includes("sw-smd") ||
    fp.includes("sw-th")
  ) {
    return "Switches";
  }

  if (
    /\b(crystal|oscillator|osc\b|mhz|khz)\b/i.test(blob) ||
    fp.includes("xtal") ||
    fp.includes("crystal")
  ) {
    return "Crystals & oscillators";
  }

  if (/\b(fuse|polyfuse|ptc|mov|tvs|esd)\b/i.test(blob) || fp.includes("fuse")) {
    return "Fuses & protection";
  }

  if (
    /\b(mount|spacer|standoff|heatsink|fan|screw|nut|washer|pad|bumper)\b/i.test(
      blob
    )
  ) {
    return "Mechanical / hardware";
  }

  if (
    /\b(ws2812|neopixel|sk68|led|rgb)\b/i.test(blob) ||
    fp.includes("led") ||
    /^LED\d/.test(desU) ||
    desU.startsWith("LED")
  ) {
    return "LEDs";
  }

  if (
    /\b(diode|schottky|zener|rectifier|ss\d|1n\d+)\b/i.test(blob) ||
    fp.includes("sod-") ||
    fp.includes("sma-") ||
    /^D\d/.test(desU)
  ) {
    return "Diodes";
  }

  if (
    /\b(mosfet|bjt|transistor|jfet|igbt)\b/i.test(blob) ||
    /^Q\d/.test(desU)
  ) {
    return "Transistors";
  }

  if (
    /\b(attiny|atmega|stm32|esp32|esp8266|rp2040|pic\d|msp430|nrf\d|cc25|mcu|soc)\b/i.test(
      blob
    ) ||
    (/^U\d/.test(desU) &&
      /\b(soic|tssop|qfn|bga|lqfp|dfn|sop-|msop|esop|qfp)\b/i.test(fp))
  ) {
    return "ICs & MCUs";
  }

  if (
    fp.includes("ferrite") ||
    fp.includes("fb-") ||
    /\bfb\b|\bbead\b|ferrite/i.test(blob)
  ) {
    return "Ferrite beads";
  }

  if (
    /\b(ind|inductor|power inductor|shielded|nrh|nrv)\b/i.test(blob) ||
    fp.includes("ind-") ||
    fp.includes("inductor") ||
    /\b(nh|uh|µh|uhy|mh)\b/i.test(c) ||
    /^L\d/i.test(desU)
  ) {
    return "Inductors & magnetics";
  }

  if (
    /^R\d/i.test(desU) ||
    fp.startsWith("r0402") ||
    fp.startsWith("r0603") ||
    fp.startsWith("r0805") ||
    fp.startsWith("r1206") ||
    /\b(ohm|ω|kω|mω|kohm|mohm)\b/i.test(c + mpn) ||
    /r\d{4}/i.test(mpn)
  ) {
    return "Resistors";
  }

  if (
    /^C\d/i.test(desU) ||
    fp.startsWith("c0402") ||
    fp.startsWith("c0603") ||
    fp.startsWith("c0805") ||
    fp.startsWith("c1206") ||
    fp.startsWith("c_") ||
    /\b(pf|nf|uf|µf|mf|farad)\b/i.test(c) ||
    /cl\d|grm|jmk|x7r|x5r|y5v|c0g/i.test(mpn)
  ) {
    return "Capacitors";
  }

  return "Other";
}
