import path from "path";
import { fileURLToPath } from "url";
import { MODEL_PRICING } from "./pricing.js";
import { appendJSONL } from "../utils/fileUtils.js";

/* --------------------------------------------
   Resolve usage log path
-------------------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USAGE_LOG_PATH = path.resolve(__dirname, "./usage-log.jsonl");

/* --------------------------------------------
   Resolve correct pricing tier
-------------------------------------------- */
const getPricingTier = (model, promptTokens) => {
  const modelConfig = MODEL_PRICING[model];

  if (!modelConfig) {
    throw new Error(`No pricing defined for model: ${model}`);
  }

  const tier = modelConfig.tiers.find((t) => promptTokens <= t.maxPromptTokens);

  if (!tier) {
    throw new Error(
      `No pricing tier matched for model ${model} with ${promptTokens} prompt tokens`
    );
  }

  return tier;
};

/* --------------------------------------------
   Calculate cost (billing accurate)
-------------------------------------------- */
const calculateCost = (model, inputTokens, outputTokens) => {
  const tier = getPricingTier(model, inputTokens);

  const inputCost = inputTokens * tier.input;
  const outputCost = outputTokens * tier.output;

  return {
    tier: {
      maxPromptTokens: tier.maxPromptTokens,
      inputRateUSDPerToken: tier.input,
      outputRateUSDPerToken: tier.output,
    },
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };
};

/* --------------------------------------------
   Public API
-------------------------------------------- */
export const trackUsage = ({ model, usage, caller }) => {
  if (!usage) {
    throw new Error("Model usage data is required for tracking");
  }

  const inputTokens = usage.promptTokenCount ?? 0;

  const visibleOutputTokens = usage.candidatesTokenCount ?? 0;
  const thinkingTokens = usage.thoughtsTokenCount ?? 0;

  const outputTokens = visibleOutputTokens + thinkingTokens;

  const cost = calculateCost(model, inputTokens, outputTokens);

  const record = {
    timestamp: new Date().toISOString(),
    caller,
    model,

    tokens: {
      input: inputTokens,
      visibleOutput: visibleOutputTokens,
      thinking: thinkingTokens,
      output: outputTokens,
      total: inputTokens + outputTokens,
    },

    pricing: {
      maxPromptTokens: cost.tier.maxPromptTokens,
      inputRateUSDPerToken: cost.tier.inputRateUSDPerToken,
      outputRateUSDPerToken: cost.tier.outputRateUSDPerToken,
    },

    cost: {
      inputUSD: Number(cost.inputCost.toFixed(6)),
      outputUSD: Number(cost.outputCost.toFixed(6)),
      totalUSD: Number(cost.totalCost.toFixed(6)),
    },
  };

  appendJSONL(USAGE_LOG_PATH, record);

  return record;
};
