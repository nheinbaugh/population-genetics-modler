import { describe, expect, test } from "vitest";

import { isLocusFixed } from "./is-locus-fixed.functions";

describe("isLocusFixed", () => {
  test("should return true if a locus has two alleles and one is at 1", () => {
    const alleleDistribution = { "1": 1.0, "2": 0.0 };
    expect(isLocusFixed(alleleDistribution)).toBe(true);
  });

  test("should return false if there are two alleles with frequencies less than 1", () => {
    const alleleDistribution = { "1": 0.5, "2": 0.5 };
    expect(isLocusFixed(alleleDistribution)).toBe(false);
  });

  test("should return true if a locus has many alleles and one is at 1", () => {
    const alleleDistribution = { "1": 0.0, "2": 0.0, "3": 1.0, "4": 0.0 };
    expect(isLocusFixed(alleleDistribution)).toBe(true);
  });

  test("should return false if a locus has many alleles and all are less than 1", () => {
    const alleleDistribution = { "1": 0.25, "2": 0.25, "3": 0.25, "4": 0.25 };
    expect(isLocusFixed(alleleDistribution)).toBe(false);
  });
});
