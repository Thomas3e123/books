export const PRICE=2900;
// Free through October 1, 2027, inclusive, in America/Chicago.
export const FREE_END=Date.parse('2027-10-02T05:00:00Z');
export const foundingYear=(now=Date.now())=>now<FREE_END;
export const paymentReady=e=>!!(e.SQUARE_ACCESS_TOKEN&&e.SQUARE_LOCATION_ID&&e.GRAVITY_HANDBOOK_BRIDGE_SECRET);
