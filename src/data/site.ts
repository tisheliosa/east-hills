/**
 * Single source of truth for business details.
 *
 * These values appear in the nav, hero, contact page, footer and the
 * LocalBusiness structured data. Change them here and they update everywhere.
 *
 * Items marked TODO need real values from the business before launch.
 */

export interface PhoneNumber {
  /** Human-readable form, e.g. "0406 128 888" */
  display: string;
  /** E.164 form for tel: links, e.g. "+61406128888" */
  tel: string;
  /** Optional label, e.g. "Main line" */
  label?: string;
}

export const site = {
  name: 'East Hills',
  legalName: 'East Hills PTY LTD',
  abn: '71 636 422 387',

  tagline: 'Wired right. Finished properly.',
  description:
    'Licensed electrical, refrigeration and fit-out work across Western Sydney. Electrical and wiring, commercial refrigeration, air conditioning, hot water systems, decking and floor lamination. Fast service, competitive rates and a three-month warranty.',

  phones: [
    { display: '0406 128 888', tel: '+61406128888', label: 'Main line' },
    { display: '0433 388 582', tel: '+61433388582', label: 'Second line' },
  ] as PhoneNumber[],

  email: 'easthillsptyltd@gmail.com',

  address: {
    unit: 'Unit 3',
    street: '1 Wiltona Place',
    suburb: 'Girraween',
    state: 'NSW',
    postcode: '2145',
    country: 'AU',
  },

  /** Approximate coordinates for Girraween NSW 2145, used in structured data. */
  geo: { latitude: -33.8009, longitude: 150.9556 },

  /**
   * TODO: confirm trading hours with the business.
   * `schema` uses schema.org OpeningHoursSpecification day names.
   */
  hours: [
    { label: 'Monday – Friday', time: '7:00am – 5:00pm', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '07:00', closes: '17:00' },
    { label: 'Saturday', time: '8:00am – 2:00pm', days: ['Saturday'], opens: '08:00', closes: '14:00' },
    { label: 'Sunday', time: 'Closed', days: ['Sunday'], opens: null, closes: null },
  ],

  /** TODO: confirm whether after-hours / emergency callouts are offered. */
  emergencyNote: 'Urgent refrigeration breakdowns are prioritised — call and we will get to you as fast as we can.',

  /** TODO: confirm the true service radius. */
  serviceArea: {
    primary: 'Western Sydney',
    detail:
      'Based in Girraween and working across Western Sydney and the greater Sydney metropolitan area — including Parramatta, Blacktown, Auburn, Merrylands, Liverpool and the Hills district.',
    suburbs: ['Parramatta', 'Blacktown', 'Auburn', 'Merrylands', 'Liverpool', 'Granville', 'Wentworthville', 'Seven Hills'],
  },

  /**
   * TODO — IMPORTANT: supply the NSW electrical contractor licence number.
   * NSW Fair Trading requires licensed electricians to display their licence
   * number on advertising, and it is the strongest trust signal on the page.
   * Set `licence.number` to the real value to make it appear site-wide.
   */
  licence: {
    number: null as string | null,
    authority: 'NSW Fair Trading',
  },

  /**
   * TODO: supply the ARCtick refrigerant handling licence number, required for
   * air conditioning and refrigeration refrigerant work.
   */
  arctick: {
    number: null as string | null,
  },

  warrantyMonths: 3,
} as const;

/** "Unit 3, 1 Wiltona Place, Girraween NSW 2145" */
export const addressOneLine = `${site.address.unit}, ${site.address.street}, ${site.address.suburb} ${site.address.state} ${site.address.postcode}`;

/** "Unit 3, 1 Wiltona Place" */
export const streetAddress = `${site.address.unit}, ${site.address.street}`;

/** Google Maps directions link for the Contact page. */
export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${site.legalName}, ${addressOneLine}`,
)}`;

export const primaryPhone = site.phones[0]!;
