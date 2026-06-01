/**
 * The online artisan contract & terms shown in the dashboard acceptance gate.
 * Bump CURRENT_CONTRACT_VERSION whenever the terms change to re-prompt artisans.
 */
export const CURRENT_CONTRACT_VERSION = '1.0';

export const ARTISAN_CONTRACT_TITLE = 'Crafts Continent Artisan Agreement';

export const ARTISAN_CONTRACT_SECTIONS: { heading: string; body: string }[] = [
  {
    heading: '1. Authenticity & Quality',
    body: 'You confirm that every product you list is authentic, lawfully made by you or your workshop, and accurately described. All items are subject to quality-control review and may be removed if they do not meet platform standards.',
  },
  {
    heading: '2. Pricing & Fees',
    body: 'You set your own base prices. Crafts Continent applies a platform markup to the displayed price and deducts agreed platform fees from each sale. Changes to the price of a live product are subject to review before they take effect.',
  },
  {
    heading: '3. Onboarding & Verification',
    body: 'You agree to complete identity and background verification, interviews, and any documentation the onboarding team requests. Your account remains subject to ongoing compliance review.',
  },
  {
    heading: '4. Fulfilment & Conduct',
    body: 'You will fulfil accepted orders promptly, communicate honestly, and treat customers and staff respectfully. Fraud, counterfeit goods, or abusive conduct may result in suspension.',
  },
  {
    heading: '5. Payouts',
    body: 'Earnings are paid to your nominated mobile-money or bank account per the platform payout schedule, net of fees and any refunds or chargebacks.',
  },
  {
    heading: '6. Term & Termination',
    body: 'Either party may end this relationship at any time. Crafts Continent may suspend or remove listings or accounts that breach these terms. Outstanding obligations survive termination.',
  },
];
