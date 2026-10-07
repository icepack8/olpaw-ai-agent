export type Zygosity =
  | "heterozygous"
  | "homozygous"
  | "unknown";

export type EvidenceLevel =
  | "high"
  | "moderate"
  | "limited"
  | "unknown";

export type RiskCategory =
  | "cardiac"
  | "renal"
  | "metabolic"
  | "general";

export type RiskLevel =
  | "low"
  | "mild"
  | "moderate"
  | "high"
  | "critical";

export type GeneticFinding = {
  gene: string;
  variant: string;
  zygosity: Zygosity;
  category: RiskCategory;

  /**
   * Evidence describing the association between
   * this variant and the relevant feline condition.
   */
  evidenceLevel: EvidenceLevel;

  /**
   * Optional breed restriction/relevance.
   * Example: ["Maine Coon"]
   */
  relevantBreeds?: string[];

  /**
   * Identifier from a veterinary genetics database,
   * such as OMIA.
   */
  evidenceId?: string;
};

export type MedicalData = {
  heartRateBpm?: number;
  respiratoryRatePerMin?: number;

  creatinineMgDl?: number;
  sdmaUgDl?: number;

  urineProteinCreatinineRatio?: number;
  systolicBloodPressureMmhg?: number;

  bodyConditionScore?: number;

  symptoms?: string[];
};

export type CatHealthData = {
  catId: string;
  name?: string;
  breed: string;
  ageYears: number;
  weightKg: number;

  geneticFindings: GeneticFinding[];

  medicalData: MedicalData;
};

export type RiskFactor = {
  category: RiskCategory;

  source:
    | "genetic"
    | "medical"
    | "age";

  description: string;

  points: number;

  evidenceLevel?: EvidenceLevel;

  evidenceId?: string;
};

export type HealthRiskResult = {
  catId: string;

  healthRiskScore: number;

  riskLevel: RiskLevel;

  riskFactors: RiskFactor[];

  recommendations: string[];

  requiresVeterinaryReview: boolean;

  /**
   * Indicates whether the score contains
   * clinically meaningful evidence or only
   * limited/demo evidence.
   */
  evidenceQuality:
    | "high"
    | "moderate"
    | "limited"
    | "insufficient";
};