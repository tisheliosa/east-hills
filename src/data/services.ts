/**
 * Single source of truth for the six service offerings.
 *
 * Consumed by Services.astro (cards), the 3D Workshop (model swapping via
 * `model`), the footer service list and the LocalBusiness offer catalog.
 */

/** Keys matching the procedural models built in src/scripts/workshop.ts */
export type ModelKey =
  | "switchboard"
  | "fridge"
  | "aircon"
  | "hotwater"
  | "deck"
  | "laminate";

export interface Service {
  id: string;
  /** Plain, searchable name — good for Google. */
  name: string;
  /** Compact label for the 3D model selector, where space is tight. */
  short: string;
  /** Benefit-led one-liner. */
  tagline: string;
  /** Two to three sentences of friendly, concrete detail. */
  body: string;
  /** Specific jobs, for scannability and long-tail search terms. */
  items: string[];
  /** Which 3D object represents this service. */
  model: ModelKey;
  /** Inner markup for a 24x24 stroked SVG icon. */
  icon: string;
}

export const services: Service[] = [
  {
    id: "hot-water-systems",
    name: "Hot Water Systems",
    short: "Hot Water",
    tagline: "Hot water back on today, not next week.",
    body: "Installation, repair and replacement of electric, gas and heat pump hot water systems. We match the right unit and size to your household or business, remove the old one, and take it away.",
    items: [
      "Electric, gas & heat pump",
      "Quality repairs",
      "Like-for-like replacement",
      "Upgrades & resizing",
      "Tempering valves",
      "Old unit removal",
      "Same-day where possible",
    ],
    model: "hotwater",
    icon: '<rect x="6.5" y="5" width="11" height="16.5" rx="5.5"/><path d="M9.5 5V2.5h5V5"/><path d="M12 11c-1.6 1.6-2.4 2.9-2.4 4a2.4 2.4 0 0 0 4.8 0c0-1.1-.8-2.4-2.4-4Z"/>',
  },
  {
    id: "decking",
    name: "Decking",
    short: "Decking",
    tagline: "Outdoor space, properly built.",
    body: "Design and construction of timber and composite decks — level, square and to code, with framing and fixings that hold up to Sydney weather rather than just looking good on day one.",
    items: [
      "Timber & composite decks",
      "Framing & sub-structure",
      "Pergolas & steps",
      "Sanding, oiling & staining",
      "Repairs & re-boarding",
    ],
    model: "deck",
    icon: '<path d="M2.5 8.5h19"/><path d="M2.5 12.5h19"/><path d="M2.5 16.5h19"/><path d="M6 8.5v13"/><path d="M18 8.5v13"/>',
  },
  {
    id: "flooring-laminate",
    name: "Flooring & Laminate",
    short: "Flooring",
    tagline: "A clean, level finish, laid fast.",
    body: "Floor lamination and hybrid or vinyl plank installation for homes, offices and retail fit-outs. We prep and level the subfloor first — the step that decides whether a floor stays flat — then lay, trim and finish with matched beading.",
    items: [
      "Laminate & hybrid flooring",
      "Vinyl plank",
      "Subfloor prep & levelling",
      "Underlay & moisture barrier",
      "Skirting, beading & trims",
      "Repairs & board replacement",
    ],
    model: "laminate",
    icon: '<rect x="2.5" y="5" width="19" height="14" rx="1.5"/><path d="M2.5 9.5h19"/><path d="M2.5 14.5h19"/><path d="M9 5v4.5"/><path d="M15 9.5v5"/><path d="M9 14.5V19"/>',
  },
  {
    id: "electrical-wiring",
    name: "Electrical & Wiring",
    short: "Electrical",
    tagline: "Compliant power for renovations.",
    body: "Full wiring for renovation work — from rough-in to final fit-off, certified and ready for inspection. We also handle switchboards, lighting, power points, fault finding, and repairs on all household electrical appliances.",
    items: [
      "Renovation rewires",
      "Switchboards & safety switches",
      "Lighting & power points",
      "Fault finding & repairs",
      "Appliance repairs",
    ],
    model: "switchboard",
    icon: '<path d="M13 2 4.5 13.5H10L9 22l8.5-11.5H12L13 2Z"/>',
  },
  {
    id: "commercial-refrigeration",
    name: "Commercial Refrigeration",
    short: "Refrigeration",
    tagline: "Keep your stock cold and your doors open.",
    body: "Installation, servicing and breakdown repairs for commercial fridges, freezers, display cabinets and cool rooms. A warm fridge is lost revenue, so refrigeration callouts go to the front of the queue.",
    items: [
      "Seals, thermostats & controls",
      "Display fridges & freezers",
      "Cool rooms",
      "Gas & compressor faults",
      "Preventative servicing",
      "Emergency breakdowns",
    ],
    model: "fridge",
    icon: '<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><line x1="5" y1="9.5" x2="19" y2="9.5"/><line x1="8.5" y1="5.5" x2="8.5" y2="7.5"/><line x1="8.5" y1="12.5" x2="8.5" y2="15.5"/>',
  },
  {
    id: "air-conditioning",
    name: "Air Conditioning",
    short: "Air Con",
    tagline: "Repairs and installs that last the summer.",
    body: "Supply, installation, servicing and repair of split and ducted systems for homes, warehouses, offices and shopfronts. Sized properly for the room, installed neatly, and tested before we leave.",
    items: [
      "Split and duct system installation",
      "Fault diagnosis & repairs",
      "Regas & servicing",
      "Filter & coil cleaning",
      "Relocations",
    ],
    model: "aircon",
    icon: '<rect x="2.5" y="4" width="19" height="7" rx="2"/><line x1="5.5" y1="8.5" x2="18.5" y2="8.5"/><path d="M7 14.5c0 2 2 2 2 4.5"/><path d="M12 14.5c0 2 2 2 2 4.5"/><path d="M17 14.5c0 2 2 2 2 4.5"/>',
  },
];

/** Cross-cutting promises pulled from the business's own brief. */
export const promises = [
  "Fast service",
  "Competitive rates",
  "3-month warranty",
  "Any trade services available",
];

export const pillars = [
  {
    title: "Licensed & insured",
    body: "Qualified, licensed tradespeople and full liability cover on every job.",
  },
  {
    title: "Fast turnaround",
    body: "We quote quickly and book quickly. Can inspect wihtin a day.",
  },
  {
    title: "Upfront rates",
    body: "Competitive pricing, fixed before we start. No hidden fees, no invoice surprises.",
  },
  {
    title: "3-month warranty",
    body: "Every repair is backed by a three-month workmanship warranty as standard.",
  },
];

export const processSteps = [
  {
    title: "Call and describe the job",
    body: "You talk to someone who actually does the work, not a call centre. We will tell you honestly whether it is a quick fix or a bigger job.",
  },
  {
    title: "Get a free, fixed quote",
    body: "We price the work before we start, inspecting if necessary, so the number you agree to is the number on the invoice. Quotes are free and there is no obligation.",
  },
  {
    title: "We do it and clean up",
    body: "The work gets done properly, tested, and the site left tidy — then backed by our three-month workmanship warranty.",
  },
];
