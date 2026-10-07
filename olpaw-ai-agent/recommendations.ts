import type {
  CatHealthData,
  HealthRiskResult,
  RiskCategory,
} from "./types";

const categoryRecommendations: Record<
  RiskCategory,
  string[]
> = {
  cardiac: [
    "Discuss cardiovascular evaluation with a qualified veterinarian.",
    "Monitor resting respiratory rate and document persistent changes.",
  ],

  renal: [
    "Discuss kidney-function evaluation with a veterinarian.",
    "Consider follow-up laboratory testing and urinalysis as clinically appropriate.",
  ],

  metabolic: [
    "Review body condition and nutrition with a veterinarian.",
    "Monitor body weight consistently over time.",
  ],

  general: [
    "Maintain routine preventive veterinary examinations.",
  ],
};

export const generateRecommendations = (
  data: CatHealthData,
  result: HealthRiskResult
): string[] => {
  const recommendations =
    new Set<string>();

  for (const factor of result.riskFactors) {
    const categoryItems =
      categoryRecommendations[
        factor.category
      ];

    for (
      const recommendation of categoryItems
    ) {
      recommendations.add(
        recommendation
      );
    }
  }

  if (
    result.evidenceQuality ===
    "limited" ||
    result.evidenceQuality ===
    "insufficient"
  ) {
    recommendations.add(
      "Treat this result as a screening signal rather than a diagnosis."
    );
  }

  if (
    result.requiresVeterinaryReview
  ) {
    recommendations.add(
      "Because the calculated screening risk is elevated, review the result with a qualified veterinarian."
    );
  }

  if (data.ageYears >= 10) {
    recommendations.add(
      "Discuss an age-appropriate preventive screening schedule with your veterinarian."
    );
  }

  if (
    result.riskFactors.length === 0
  ) {
    recommendations.add(
      "Continue routine preventive veterinary care and monitor overall health."
    );
  }

  return Array.from(
    recommendations
  );
};

export const buildHealthRiskResult = (
  data: CatHealthData,
  result: HealthRiskResult
): HealthRiskResult => {
  return {
    ...result,

    recommendations:
      generateRecommendations(
        data,
        result
      ),
  };
};