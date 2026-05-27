import { describe, expect, test } from "vitest";
import { ConfigurationValidationError } from "./configuration-validation.error";
import { validateLociExistence } from "./validate-loci-existence.functions";
import { validateLocusFrequencies } from "./validate-locus-frequencies.functions";
import type { Locus } from "../../models/core/locus.interface";
import { validateMutationAlleleIds } from "./validate-locus-mutation-matrix.functions";

describe("validateSimulationConfiguration", () => {
  // still need to write a test or three that will validate that the top level combination of them all work

  describe('validateLociExistence', () => {
    test("it should throw an error when there are no alleles in a locus", () => {
      expect(() => validateLociExistence([])).toThrow();
    });
  });

  describe('validateLocusFrequencies', () => {
    test('it should throw an error when the sum of alleles for a locus is less than 1', () => {
      const modeledLoci: Locus[] = [
        {
          id: 'locus|a',
          label: 'Basic Allele',
          mutationMatrix: [],
          alleles: [
            {
              id: 'allele|a',
              label: 'a',
              initialFrequency: .2,
              fitnessModifier: 1,
            },
            {
              id: 'allele|b',
              label: 'b',
              initialFrequency: .2,
              fitnessModifier: 1,
            }
          ]
        }
      ]
      expect(() => validateLocusFrequencies(modeledLoci)).toThrow(ConfigurationValidationError);
    })

    test('it should throw an error when the sum of alleles for a locus is more than 1', () => {
      const modeledLoci: Locus[] = [
        {
          id: 'locus|a',
          label: 'Basic Allele',
          mutationMatrix: [],
          alleles: [
            {
              id: 'allele|a',
              label: 'a',
              initialFrequency: .2,
              fitnessModifier: 1,
            },
            {
              id: 'allele|b',
              label: 'b',
              initialFrequency: .9,
              fitnessModifier: 1,
            }
          ]
        }
      ];
      expect(() => validateLocusFrequencies(modeledLoci)).toThrow(ConfigurationValidationError);
    })

    test('it should not throw an error when the sum of alleles for a loucs is 1', () => {
      const modeledLoci: Locus[] = [
        {
          id: 'locus|a',
          label: 'Basic Allele',
          mutationMatrix: [],
          alleles: [
            {
              id: 'allele|a',
              label: 'a',
              initialFrequency: .25,
              fitnessModifier: 1,
            },
            {
              id: 'allele|b',
              label: 'b',
              initialFrequency: .75,
              fitnessModifier: 1,
            }
          ]
        }
      ];
      expect(() => validateLocusFrequencies(modeledLoci)).not.toThrow(ConfigurationValidationError);
    })
  });

  describe('validateLocusMutationMatrix', () => {
    test('should throw an error if there is no mutation array', () => {
      const modeledLoci: Locus[] = [
        {
          id: 'locus|a',
          label: 'Basic Allele',
          mutationMatrix: [],
          alleles: [
            {
              id: 'allele|a',
              label: 'a',
              initialFrequency: .2,
              fitnessModifier: 1,
            },
            {
              id: 'allele|b',
              label: 'b',
              initialFrequency: .2,
              fitnessModifier: 1,
            }
          ]
        }
      ]
      expect(() => validateMutationAlleleIds(modeledLoci)).toThrow(ConfigurationValidationError);
    })

    test('should throw an error if the mutation matrix references an unknown source allele id', () => {
      const modeledLoci: Locus[] = [
        {
          id: 'locus|a',
          label: 'Basic Allele',
          mutationMatrix: [
            {
              sourceAlleleId: 'allele|invalid',
              mutationRates: [
                {
                  mutatedAlleleId: 'allele|b',
                  rateOfMutation: .2
                }
              ]
            }
          ],
          alleles: [
            {
              id: 'allele|a',
              label: 'a',
              initialFrequency: .2,
              fitnessModifier: 1,
            },
            {
              id: 'allele|b',
              label: 'b',
              initialFrequency: .2,
              fitnessModifier: 1,
            }
          ]
        }
      ]

      expect(() => validateMutationAlleleIds(modeledLoci)).toThrow(ConfigurationValidationError);
    })

    test('should throw an error if the mutation matrix references an unknown mutatatedAlleleId', () => {
      const modeledLoci: Locus[] = [
        {
          id: 'locus|a',
          label: 'Basic Allele',
          mutationMatrix: [
            {
              sourceAlleleId: 'allele|a',
              mutationRates: [
                {
                  mutatedAlleleId: 'allele|invalid',
                  rateOfMutation: .2
                }
              ]
            }
          ],
          alleles: [
            {
              id: 'allele|a',
              label: 'a',
              initialFrequency: .2,
              fitnessModifier: 1,
            },
            {
              id: 'allele|b',
              label: 'b',
              initialFrequency: .2,
              fitnessModifier: 1,
            }
          ]
        }
      ]

      expect(() => validateMutationAlleleIds(modeledLoci)).toThrow(ConfigurationValidationError);
    })

    test('should throw an error if the mutation matrix has a negative mutation rate', () => {
      const modeledLoci: Locus[] = [
        {
          id: 'locus|a',
          label: 'Basic Allele',
          mutationMatrix: [
            {
              sourceAlleleId: 'allele|a',
              mutationRates: [
                {
                  mutatedAlleleId: 'allele|b',
                  rateOfMutation: -.2
                }
              ]
            }
          ],
          alleles: [
            {
              id: 'allele|a',
              label: 'a',
              initialFrequency: .2,
              fitnessModifier: 1,
            },
            {
              id: 'allele|b',
              label: 'b',
              initialFrequency: .2,
              fitnessModifier: 1,
            }
          ]
        }
      ]

      expect(() => validateMutationAlleleIds(modeledLoci)).toThrow(ConfigurationValidationError);
    })

  })
});
