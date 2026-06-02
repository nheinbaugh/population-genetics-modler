import { describe, expect, test } from "vitest";

import type { Locus } from "../../models/core/locus.interface";
import type { SimulationConfiguration } from "../../models/simulation/simulation.interface";
import { ConfigurationValidationError } from "./configuration-validation.error";
import { validateLociExistence } from "./validate-loci-existence.functions";
import { validateLocusFrequencies } from "./validate-locus-frequencies.functions";
import { validateMutationAlleleIds } from "./validate-locus-mutation-matrix.functions";
import { validateSimulationConfiguration } from "./validate-simulation-configuration.functions";

describe("validateSimulationConfiguration", () => {
  test("a completely valid configuration should not throw any errors", () => {
    const configuration: SimulationConfiguration = {
      strategy: "population",
      isPopulationSizeStatic: true,
      initialPopulationSize: 2000,
      generations: 20,
      modeledLoci: [
        {
          id: "locus|a",
          label: "Basic Allele",
          mutationMatrix: [
            {
              fromAlleleId: "allele|a",
              mutationRates: [
                {
                  toAlleleId: "allele|b",
                  rateOfMutation: 0.2,
                },
              ],
            },
          ],
          alleles: [
            {
              id: "allele|a",
              label: "a",
              initialFrequency: 0.8,
              fitnessModifier: 1,
            },
            {
              id: "allele|b",
              label: "b",
              initialFrequency: 0.2,
              fitnessModifier: 1,
            },
          ],
        },
      ],
    };
    expect(() => validateSimulationConfiguration(configuration)).not.toThrow(
      ConfigurationValidationError,
    );
  });

  // all invalid configurations are covered by the following tests.

  describe("validateLociExistence", () => {
    test("it should throw an error when there are no alleles in a locus", () => {
      expect(() => validateLociExistence([])).toThrow();
    });
  });

  describe("validateLocusFrequencies", () => {
    test("it should throw an error when the sum of alleles for a locus is less than 1", () => {
      const modeledLoci: Locus[] = [
        {
          id: "locus|a",
          label: "Basic Allele",
          mutationMatrix: [],
          alleles: [
            {
              id: "allele|a",
              label: "a",
              initialFrequency: 0.2,
              fitnessModifier: 1,
            },
            {
              id: "allele|b",
              label: "b",
              initialFrequency: 0.2,
              fitnessModifier: 1,
            },
          ],
        },
      ];
      expect(() => validateLocusFrequencies(modeledLoci)).toThrow(
        ConfigurationValidationError,
      );
    });

    test("it should throw an error when the sum of alleles for a locus is more than 1", () => {
      const modeledLoci: Locus[] = [
        {
          id: "locus|a",
          label: "Basic Allele",
          mutationMatrix: [],
          alleles: [
            {
              id: "allele|a",
              label: "a",
              initialFrequency: 0.2,
              fitnessModifier: 1,
            },
            {
              id: "allele|b",
              label: "b",
              initialFrequency: 0.9,
              fitnessModifier: 1,
            },
          ],
        },
      ];
      expect(() => validateLocusFrequencies(modeledLoci)).toThrow(
        ConfigurationValidationError,
      );
    });

    test("it should not throw an error when the sum of alleles for a loucs is 1", () => {
      const modeledLoci: Locus[] = [
        {
          id: "locus|a",
          label: "Basic Allele",
          mutationMatrix: [],
          alleles: [
            {
              id: "allele|a",
              label: "a",
              initialFrequency: 0.25,
              fitnessModifier: 1,
            },
            {
              id: "allele|b",
              label: "b",
              initialFrequency: 0.75,
              fitnessModifier: 1,
            },
          ],
        },
      ];
      expect(() => validateLocusFrequencies(modeledLoci)).not.toThrow(
        ConfigurationValidationError,
      );
    });
  });

  describe("validateLocusMutationMatrix", () => {
    test("should throw an error if there is no mutation array", () => {
      const modeledLoci: Locus[] = [
        {
          id: "locus|a",
          label: "Basic Allele",
          mutationMatrix: [],
          alleles: [
            {
              id: "allele|a",
              label: "a",
              initialFrequency: 0.2,
              fitnessModifier: 1,
            },
            {
              id: "allele|b",
              label: "b",
              initialFrequency: 0.2,
              fitnessModifier: 1,
            },
          ],
        },
      ];
      expect(() => validateMutationAlleleIds(modeledLoci)).toThrow(
        ConfigurationValidationError,
      );
    });

    test("should throw an error if the mutation matrix references an unknown source allele id", () => {
      const modeledLoci: Locus[] = [
        {
          id: "locus|a",
          label: "Basic Allele",
          mutationMatrix: [
            {
              fromAlleleId: "allele|invalid",
              mutationRates: [
                {
                  toAlleleId: "allele|b",
                  rateOfMutation: 0.2,
                },
              ],
            },
          ],
          alleles: [
            {
              id: "allele|a",
              label: "a",
              initialFrequency: 0.2,
              fitnessModifier: 1,
            },
            {
              id: "allele|b",
              label: "b",
              initialFrequency: 0.2,
              fitnessModifier: 1,
            },
          ],
        },
      ];

      expect(() => validateMutationAlleleIds(modeledLoci)).toThrow(
        ConfigurationValidationError,
      );
    });

    test("should throw an error if the mutation matrix references an unknown mutatatedAlleleId", () => {
      const modeledLoci: Locus[] = [
        {
          id: "locus|a",
          label: "Basic Allele",
          mutationMatrix: [
            {
              fromAlleleId: "allele|a",
              mutationRates: [
                {
                  toAlleleId: "allele|invalid",
                  rateOfMutation: 0.2,
                },
              ],
            },
          ],
          alleles: [
            {
              id: "allele|a",
              label: "a",
              initialFrequency: 0.2,
              fitnessModifier: 1,
            },
            {
              id: "allele|b",
              label: "b",
              initialFrequency: 0.2,
              fitnessModifier: 1,
            },
          ],
        },
      ];

      expect(() => validateMutationAlleleIds(modeledLoci)).toThrow(
        ConfigurationValidationError,
      );
    });

    test("should throw an error if the mutation matrix has a negative mutation rate", () => {
      const modeledLoci: Locus[] = [
        {
          id: "locus|a",
          label: "Basic Allele",
          mutationMatrix: [
            {
              fromAlleleId: "allele|a",
              mutationRates: [
                {
                  toAlleleId: "allele|b",
                  rateOfMutation: -0.2,
                },
              ],
            },
          ],
          alleles: [
            {
              id: "allele|a",
              label: "a",
              initialFrequency: 0.2,
              fitnessModifier: 1,
            },
            {
              id: "allele|b",
              label: "b",
              initialFrequency: 0.2,
              fitnessModifier: 1,
            },
          ],
        },
      ];

      expect(() => validateMutationAlleleIds(modeledLoci)).toThrow(
        ConfigurationValidationError,
      );
    });
  });
});
