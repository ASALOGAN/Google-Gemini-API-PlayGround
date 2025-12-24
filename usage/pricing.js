/**
 * Pricing is defined as USD per TOKEN (not per 1M)
 * This avoids repeated division bugs and keeps math simple.
 *
 * Source: Google AI Studio pricing (Dec 2025)
 */

export const MODEL_PRICING = {
  /* =====================================================
     Gemini 3 Preview
  ===================================================== */

  "gemini-3-pro-preview": {
    tiers: [
      {
        maxPromptTokens: 200_000,
        input: 2.0 / 1_000_000,
        output: 12.0 / 1_000_000,
      },
      {
        maxPromptTokens: Infinity,
        input: 4.0 / 1_000_000,
        output: 18.0 / 1_000_000,
      },
    ],
  },

  "gemini-3-flash-preview": {
    tiers: [
      {
        maxPromptTokens: Infinity,
        input: 0.5 / 1_000_000, // text / image / video
        output: 3.0 / 1_000_000, // includes thinking tokens
      },
    ],
  },

  /* =====================================================
     Gemini 2.5
  ===================================================== */

  "gemini-2.5-pro": {
    tiers: [
      {
        maxPromptTokens: 200_000,
        input: 1.25 / 1_000_000,
        output: 10.0 / 1_000_000,
      },
      {
        maxPromptTokens: Infinity,
        input: 2.5 / 1_000_000,
        output: 15.0 / 1_000_000,
      },
    ],
  },

  "gemini-2.5-flash": {
    tiers: [
      {
        maxPromptTokens: Infinity,
        input: 0.3 / 1_000_000, // text / image / video
        output: 2.5 / 1_000_000, // includes thinking tokens
      },
    ],
  },
};
