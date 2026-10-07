import type {
  CatHealthData,
  EvidenceLevel,
  HealthRiskResult,
  RiskFactor,
  RiskLevel,
} from "./types";

const clamp = (
  value: number,
  min: number,
  max: number
): number => {
  return Math.min(Math.max(value, min), max);
};

const getRiskLevel = (
  score: number
): RiskLevel => {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "moderate";
  if (score >= 20) return "mild";

  return "low";
};

const evidenceWeight = (
  evidence: EvidenceLevel
): number => {
  switch (evidence) {
    case "high":
      return 1;

    case "moderate":
      return 0.7;

    case "limited":
      return 0.4;

    case "unknown":
      return 0;
  }
};

const breedMatches = (
  catBreed: string,
  relevantBreeds?: string[]
): boolean => {
  if (!relevantBreeds || relevantBreeds.length === 0) {
    return true;
  }

  return relevantBreeds.some(
    (breed) =>
      breed.toLowerCase() === catBreed.toLowerCase()
  );
};

const calculateGeneticRisk = (
  data: CatHealthData
): RiskFactor[] => {
  const factors: RiskFactor[] = [];

  for (const finding of data.geneticFindings) {
    const weight = evidenceWeight(
      finding.evidenceLevel
    );

    if (weight === 0) {
      continue;
    }

    const breedRelevant = breedMatches(
      data.breed,
      finding.relevantBreeds
    );

    if (!breedRelevant) {
      continue;
    }

    let basePoints = 0;

    if (
      finding.zygosity === "homozygous"
    ) {
      basePoints = 20;
    } else if (
      finding.zygosity === "heterozygous"
    ) {
      basePoints = 8;
    }

    const points = Math.round(
      basePoints * weight
    );

    if (points === 0) {
      continue;
    }

    factors.push({
      category: finding.category,
      source: "genetic",

      description:
        `Genetic finding ${finding.gene} ${finding.variant} ` +
        `(${finding.zygosity}) is relevant to ` +
        `${data.breed} with ${finding.evidenceLevel} evidence.`,

      points,

      evidenceLevel:
        finding.evidenceLevel,

      evidenceId:
        finding.evidenceId,
    });
  }

  return factors;
};

const calculateMedicalRisk = (
  data: CatHealthData
): RiskFactor[] => {
  const factors: RiskFactor[] = [];

  const medical = data.medicalData;

  /*
   * These are screening signals, NOT diagnostic
   * thresholds. They should eventually be replaced
   * with validated veterinary decision rules.
   */

  if (
    medical.respiratoryRatePerMin !== undefined &&
    medical.respiratoryRatePerMin > 40
  ) {
    factors.push({
      category: "cardiac",
      source: "medical",

      description:
        "Resting respiratory rate is elevated " +
        "and warrants veterinary assessment.",

      points: 15,

      evidenceLevel: "moderate",
    });
  }

  if (
    medical.creatinineMgDl !== undefined &&
    medical.creatinineMgDl > 2
  ) {
    factors.push({
      category: "renal",
      source: "medical",

      description:
        "Creatinine is elevated relative to " +
        "the configured screening threshold.",

      points: 15,

      evidenceLevel: "moderate",
    });
  }

  if (
    medical.bodyConditionScore !== undefined &&
    medical.bodyConditionScore >= 8
  ) {
    factors.push({
      category: "metabolic",
      source: "medical",

      description:
        "Body condition score indicates " +
        "possible excess body condition.",

      points: 10,

      evidenceLevel: "moderate",
    });
  }

  return factors;
};

const calculateAgeRisk = (
  data: CatHealthData
): RiskFactor[] => {
  if (data.ageYears < 10) {
    return [];
  }

  return [
    {
      category: "general",
      source: "age",

      description:
        "Age is within the senior-cat " +
        "screening range.",

      points: 10,

      evidenceLevel: "limited",
    },
  ];
};

const determineEvidenceQuality = (
  factors: RiskFactor[]
): HealthRiskResult["evidenceQuality"] => {
  if (factors.length === 0) {
    return "insufficient";
  }

  const levels = factors
    .map((factor) => factor.evidenceLevel)
    .filter(
      (
        level
      ): level is EvidenceLevel =>
        level !== undefined
    );

  if (levels.includes("high")) {
    return "high";
  }

  if (levels.includes("moderate")) {
    return "moderate";
  }

  if (levels.includes("limited")) {
    return "limited";
  }

  return "insufficient";
};

export const calculateHealthRisk = (
  data: CatHealthData
): HealthRiskResult => {
  const geneticFactors =
    calculateGeneticRisk(data);

  const medicalFactors =
    calculateMedicalRisk(data);

  const ageFactors =
    calculateAgeRisk(data);

  const riskFactors = [
    ...geneticFactors,
    ...medicalFactors,
    ...ageFactors,
  ];

  const rawScore =
    riskFactors.reduce(
      (total, factor) =>
        total + factor.points,
      0
    );

  const healthRiskScore =
    clamp(rawScore, 0, 100);

  const riskLevel =
    getRiskLevel(healthRiskScore);

  const evidenceQuality =
    determineEvidenceQuality(
      riskFactors
    );

  return {
    catId: data.catId,

    healthRiskScore,

    riskLevel,

    riskFactors,

    recommendations: [],

    requiresVeterinaryReview:
      healthRiskScore >= 60,

    evidenceQuality,
  };
};