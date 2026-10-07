import {
  CronCapability,
  handler,
  Runner,
  type Runtime,
} from "@chainlink/cre-sdk";

import {
  calculateHealthRisk,
} from "./risk-engine";

import {
  buildHealthRiskResult,
} from "./recommendations";

import type {
  CatHealthData,
} from "./types";

export type Config = {
  schedule: string;
  cat: CatHealthData;
};

export const onCronTrigger = (
  runtime: Runtime<Config>
): string => {
  const cat = runtime.config.cat;

  const baseResult =
    calculateHealthRisk(cat);

  const result =
    buildHealthRiskResult(
      cat,
      baseResult
    );

  runtime.log(
    `Health Risk Analysis completed for ${cat.catId}`
  );

  runtime.log(
    `Cat: ${cat.name ?? "Unknown"}`
  );

  runtime.log(
    `Health Risk Score: ${result.healthRiskScore}/100`
  );

  runtime.log(
    `Risk Level: ${result.riskLevel}`
  );

  runtime.log(
    `Evidence Quality: ${result.evidenceQuality}`
  );

  runtime.log(
    `Veterinary Review Required: ${result.requiresVeterinaryReview}`
  );

  return JSON.stringify({
    ...result,
    catName: cat.name,
    breed: cat.breed,
  });
};

export const initWorkflow = (
  config: Config
) => {
  const cron =
    new CronCapability();

  return [
    handler(
      cron.trigger({
        schedule:
          config.schedule,
      }),
      onCronTrigger
    ),
  ];
};

export async function main() {
  const runner =
    await Runner.newRunner<Config>();

  await runner.run(
    initWorkflow
  );
}