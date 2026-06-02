import { EPSILON } from "../models/core/epsilon.const";

/**
 * NOTE: This is a naive implentation that considers a locus fixed if the entire population has the same
 * allele. In the real world there would still be some variation because of mutation.
 * For now we will leave this as is and then we can add a configuration value for fixation.
 */

/**
 * Function that determines if a locus is fixed. If a locus is fixed then no changes will occur at that locus in future generations, so we can skip processing it in our simulation engine.
 *
 * @returns A boolean indicating if the locus is fixed or still in flux
 */
export function isLocusFixed(
  alleleDistribution: Record<string, number>,
): boolean {
  const frequencies = Object.values(alleleDistribution);
  for (let i = 0; i < frequencies.length; i++) {
    // If any single allele is effectively 1.0, the locus is fixed
    if (1.0 - frequencies[i] < EPSILON) {
      return true;
    }
  }
  return false;
}
