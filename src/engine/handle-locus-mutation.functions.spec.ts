import { describe, expect, test } from "vitest";

import { handleLocusMutations } from "./handle-locus-mutation.functions";
import type { AlleleIndexMap } from "./types/allele-index-map";

describe("handleLocusMutation", () => {
  test("should return the original frequencies if the mutation rates are all zero", () => {
    const locus = {
      id: "locus|a",
      label: "Basic Allele",
      mutationMatrix: [
        {
          fromAlleleId: "allele|a",
          mutationRates: [
            {
              toAlleleId: "allele|b",
              rateOfMutation: 0.0,
            },
          ],
        },
        {
          fromAlleleId: "allele|b",
          mutationRates: [
            {
              toAlleleId: "allele|a",
              rateOfMutation: 0.0,
            },
          ],
        },
      ],
      alleles: [
        {
          id: "allele|a",
          label: "a",
          initialFrequency: 0.2,
          fitnessModifier: 0.9,
        },
        {
          id: "allele|b",
          label: "b",
          initialFrequency: 0.2,
          fitnessModifier: 1,
        },
      ],
    };
    const alleleFrequencies = new Float64Array([0.2, 0.8]);
    const indexMap: AlleleIndexMap = new Map()
      .set("allele|a", 1)
      .set("allele|b", 0);

    const result = handleLocusMutations(alleleFrequencies, locus, indexMap);
    expect(result[0]).toBe(0.2);
    expect(result[1]).toBe(0.8);
  });

  test("should return a locus with 100% frequency is one of the alleles has 100% mutation rate to another allele", () => {
    const locus = {
      id: "locus|a",
      label: "Basic Allele",
      mutationMatrix: [
        {
          fromAlleleId: "allele|a",
          mutationRates: [
            {
              toAlleleId: "allele|b",
              rateOfMutation: 1.0,
            },
          ],
        },
        {
          fromAlleleId: "allele|b",
          mutationRates: [
            {
              toAlleleId: "allele|a",
              rateOfMutation: 0.0,
            },
          ],
        },
      ],
      alleles: [
        {
          id: "allele|a",
          label: "a",
          initialFrequency: 0.2,
          fitnessModifier: 0.9,
        },
        {
          id: "allele|b",
          label: "b",
          initialFrequency: 0.2,
          fitnessModifier: 1,
        },
      ],
    };
    const alleleFrequencies = new Float64Array([0.2, 0.8]);
    const indexMap: AlleleIndexMap = new Map()
      .set("allele|a", 1)
      .set("allele|b", 0);

    const result = handleLocusMutations(alleleFrequencies, locus, indexMap);
    expect(result[0]).toBe(1);
    expect(result[1]).toBe(0);
  });

  test("should throw an error if an allele can mutate to an allele that is not in the locus", () => {
    const locus = {
      id: "locus|a",
      label: "Basic Allele",
      mutationMatrix: [
        {
          fromAlleleId: "allele|a",
          mutationRates: [
            {
              toAlleleId: "allele|doesnotexistonlocus",
              rateOfMutation: 0.0,
            },
          ],
        },
        {
          fromAlleleId: "allele|b",
          mutationRates: [
            {
              toAlleleId: "allele|a",
              rateOfMutation: 0.0,
            },
          ],
        },
      ],
      alleles: [
        {
          id: "allele|a",
          label: "a",
          initialFrequency: 0.2,
          fitnessModifier: 0.9,
        },
        {
          id: "allele|b",
          label: "b",
          initialFrequency: 0.2,
          fitnessModifier: 1,
        },
      ],
    };
    const alleleFrequencies = new Float64Array([0.2, 0.8]);
    const indexMap: AlleleIndexMap = new Map()
      .set("allele|a", 1)
      .set("allele|b", 0);

    expect(() =>
      handleLocusMutations(alleleFrequencies, locus, indexMap),
    ).toThrowError(
      "Unable to find index for allele with id allele|doesnotexistonlocus in locus Basic Allele",
    );
  });

  test("should return a higher frequency for an allele that can be mutated from other alleles", () => {
    const locus = {
      id: "locus|a",
      label: "Basic Allele",
      mutationMatrix: [
        {
          fromAlleleId: "allele|a",
          mutationRates: [
            {
              toAlleleId: "allele|b",
              rateOfMutation: 0.3,
            },
          ],
        },
        {
          fromAlleleId: "allele|b",
          mutationRates: [
            {
              toAlleleId: "allele|a",
              rateOfMutation: 0.0,
            },
          ],
        },
      ],
      alleles: [
        {
          id: "allele|a",
          label: "a",
          initialFrequency: 0.2,
          fitnessModifier: 0.9,
        },
        {
          id: "allele|b",
          label: "b",
          initialFrequency: 0.2,
          fitnessModifier: 1,
        },
      ],
    };
    const alleleFrequencies = new Float64Array([0.2, 0.8]);
    const indexMap: AlleleIndexMap = new Map()
      .set("allele|a", 1)
      .set("allele|b", 0);
    const result = handleLocusMutations(alleleFrequencies, locus, indexMap);
    expect(result[0]).toBeGreaterThan(alleleFrequencies[0]);
    expect(result[1]).toBeLessThan(alleleFrequencies[1]);
  });

  test("an allele that has mutated this cycle cannot mutate again in the same cycle", () => {
    // this is a bit contrived, but if a locus with 3 alleles has two alleles with 100% mutation rates then we want to make sure that the allele that mutated in from the first allele does not then also mutate out to the third allele in the same cycle. This is because we want to make sure that mutation is based on the starting frequencies and not allow for a cascading effect where an allele that mutates in can then also mutate out in the same cycle.
    // a should go fully to b
    // b should go fully to c
    // c should be c + original b
    const locus = {
      id: "locus|a",
      label: "Basic Allele",
      mutationMatrix: [
        {
          fromAlleleId: "allele|a",
          mutationRates: [
            {
              toAlleleId: "allele|b",
              rateOfMutation: 1.0,
            },
          ],
        },
        {
          fromAlleleId: "allele|b",
          mutationRates: [
            {
              toAlleleId: "allele|c",
              rateOfMutation: 1.0,
            },
          ],
        },
        {
          fromAlleleId: "allele|c",
          mutationRates: [],
        },
      ],
      alleles: [
        {
          id: "allele|a",
          label: "a",
          initialFrequency: 0.2,
          fitnessModifier: 0.9,
        },
        {
          id: "allele|b",
          label: "b",
          initialFrequency: 0.2,
          fitnessModifier: 1,
        },
        {
          id: "allele|c",
          label: "c",
          initialFrequency: 0.2,
          fitnessModifier: 1,
        },
      ],
    };

    const alleleFrequencies = new Float64Array([0.2, 0.2, 0.6]);
    const indexMap: AlleleIndexMap = new Map()
      .set("allele|a", 0)
      .set("allele|b", 1)
      .set("allele|c", 2);
    const result = handleLocusMutations(alleleFrequencies, locus, indexMap);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(0.2);
    expect(result[2]).toBe(0.8);
  });

  test("updated frequencies should sum to 1", () => {
    const locus = {
      id: "locus|a",
      label: "Basic Allele",
      mutationMatrix: [
        {
          fromAlleleId: "allele|a",
          mutationRates: [
            {
              toAlleleId: "allele|b",
              rateOfMutation: 0.3,
            },
          ],
        },
        {
          fromAlleleId: "allele|b",
          mutationRates: [
            {
              toAlleleId: "allele|a",
              rateOfMutation: 0.0,
            },
          ],
        },
      ],
      alleles: [
        {
          id: "allele|a",
          label: "a",
          initialFrequency: 0.2,
          fitnessModifier: 0.9,
        },
        {
          id: "allele|b",
          label: "b",
          initialFrequency: 0.2,
          fitnessModifier: 1,
        },
      ],
    };
    const alleleFrequencies = new Float64Array([0.2, 0.8]);
    const indexMap: AlleleIndexMap = new Map()
      .set("allele|a", 1)
      .set("allele|b", 0);
    const result = handleLocusMutations(alleleFrequencies, locus, indexMap);
    expect(result[0] + result[1]).toBeCloseTo(1);
  });
});
