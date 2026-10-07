import {
  describe,
  expect,
} from "bun:test";

import {
  newTestRuntime,
  test,
} from "@chainlink/cre-sdk/test";

import {
  calculateHealthRisk,
} from "./risk-engine";

import {
  buildHealthRiskResult,
} from "./recommendations";

import {
  initWorkflow,
  onCronTrigger,
} from "./main";

import type {
  CatHealthData,
  Config,
} from "./main";

describe("Evidence-aware Health Risk Engine", () => {
  test(
    "returns insufficient evidence when there are no risk factors",
    () => {
      const cat: CatHealthData = {
        catId: "TEST-001",
        name: "Healthy Cat",
        breed: "Domestic Shorthair",
        ageYears: 3,
        weightKg: 4.5,

        geneticFindings: [],

        medicalData: {},
      };

      const result =
        calculateHealthRisk(cat);

      expect(
        result.healthRiskScore
      ).toBe(0);

      expect(
        result.riskLevel
      ).toBe("low");

      expect(
        result.evidenceQuality
      ).toBe("insufficient");

      expect(
        result.requiresVeterinaryReview
      ).toBe(false);
    }
  );

  test(
    "recognizes a high-evidence heterozygous genetic finding",
    () => {
      const cat: CatHealthData = {
        catId: "TEST-002",
        name: "Maine Coon",
        breed: "Maine Coon",
        ageYears: 5,
        weightKg: 5.5,

        geneticFindings: [
          {
            gene: "MYBPC3",
            variant: "p.A31P",
            zygosity: "heterozygous",
            category: "cardiac",
            evidenceLevel: "high",
            relevantBreeds: [
              "Maine Coon",
            ],
            evidenceId: "OMIA:901",
          },
        ],

        medicalData: {},
      };

      const result =
        calculateHealthRisk(cat);

      expect(
        result.healthRiskScore
      ).toBe(8);

      expect(
        result.riskLevel
      ).toBe("low");

      expect(
        result.evidenceQuality
      ).toBe("high");

      expect(
        result.riskFactors
      ).toHaveLength(1);

      expect(
        result.riskFactors[0].evidenceId
      ).toBe("OMIA:901");
    }
  );

  test(
    "does not apply breed-specific finding to an unrelated breed",
    () => {
      const cat: CatHealthData = {
        catId: "TEST-003",
        name: "Domestic Cat",
        breed: "Domestic Shorthair",
        ageYears: 5,
        weightKg: 4.5,

        geneticFindings: [
          {
            gene: "MYBPC3",
            variant: "p.A31P",
            zygosity: "homozygous",
            category: "cardiac",
            evidenceLevel: "high",
            relevantBreeds: [
              "Maine Coon",
            ],
            evidenceId: "OMIA:901",
          },
        ],

        medicalData: {},
      };

      const result =
        calculateHealthRisk(cat);

      expect(
        result.healthRiskScore
      ).toBe(0);

      expect(
        result.riskFactors
      ).toHaveLength(0);
    }
  );

  test(
    "combines genetic, medical and age factors",
    () => {
      const cat: CatHealthData = {
        catId: "TEST-004",
        name: "Senior Maine Coon",
        breed: "Maine Coon",
        ageYears: 11,
        weightKg: 7.5,

        geneticFindings: [
          {
            gene: "MYBPC3",
            variant: "p.A31P",
            zygosity: "homozygous",
            category: "cardiac",
            evidenceLevel: "high",
            relevantBreeds: [
              "Maine Coon",
            ],
            evidenceId: "OMIA:901",
          },
        ],

        medicalData: {
          respiratoryRatePerMin: 50,
          creatinineMgDl: 2.5,
          bodyConditionScore: 9,
        },
      };

      const result =
        calculateHealthRisk(cat);

      expect(
        result.healthRiskScore
      ).toBe(70);

      expect(
        result.riskLevel
      ).toBe("high");

      expect(
        result.requiresVeterinaryReview
      ).toBe(true);

      expect(
        result.evidenceQuality
      ).toBe("high");
    }
  );

  test(
    "generates recommendations for elevated risk",
    () => {
      const cat: CatHealthData = {
        catId: "TEST-005",
        name: "Risky Cat",
        breed: "Maine Coon",
        ageYears: 11,
        weightKg: 8,

        geneticFindings: [
          {
            gene: "MYBPC3",
            variant: "p.A31P",
            zygosity: "homozygous",
            category: "cardiac",
            evidenceLevel: "high",
            relevantBreeds: [
              "Maine Coon",
            ],
            evidenceId: "OMIA:901",
          },
        ],

        medicalData: {
          respiratoryRatePerMin: 45,
          bodyConditionScore: 9,
        },
      };

      const baseResult =
        calculateHealthRisk(cat);

      const result =
        buildHealthRiskResult(
          cat,
          baseResult
        );

      expect(
        result.recommendations.length
      ).toBeGreaterThan(0);

      expect(
        result.recommendations.some(
          (item) =>
            item
              .toLowerCase()
              .includes("veterinarian")
        )
      ).toBe(true);
    }
  );
});

describe("CRE Workflow", () => {
  test(
    "creates one cron handler",
    () => {
      const config: Config = {
        schedule: "0 0 * * *",
        cat: {
          catId: "TEST-001",
          name: "Test Cat",
          breed: "Maine Coon",
          ageYears: 5,
          weightKg: 5.5,
          geneticFindings: [],
          medicalData: {},
        },
      };

      const handlers =
        initWorkflow(config);

      expect(
        handlers
      ).toBeArray();

      expect(
        handlers
      ).toHaveLength(1);

      expect(
        handlers[0]
          .trigger
          .config
          .schedule
      ).toBe(
        config.schedule
      );
    }
  );

  test(
    "executes the health risk workflow",
    () => {
      const config: Config = {
        schedule: "*/5 * * * *",

        cat: {
          catId: "TEST-001",
          name: "Test Cat",
          breed: "Maine Coon",
          ageYears: 5,
          weightKg: 5.5,

          geneticFindings: [],

          medicalData: {},
        },
      };

      const runtime =
        newTestRuntime();

      runtime.config =
        config;

      const result =
        onCronTrigger(runtime);

      const parsed =
        JSON.parse(result);

      expect(
        parsed.catId
      ).toBe("TEST-001");

      expect(
        parsed.catName
      ).toBe("Test Cat");

      expect(
        parsed.breed
      ).toBe("Maine Coon");

      expect(
        parsed.healthRiskScore
      ).toBe(0);

      expect(
        parsed.riskLevel
      ).toBe("low");
    }
  );
});