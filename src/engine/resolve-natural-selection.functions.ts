import type { Allele } from "../models/core/allele.interface";
import type { Locus } from "../models/core/locus.interface";

/**
 * This function simulates natural selection acting against a given locus throughout the population.
 * It takes the current frequency and applies fitness to it to essentially return the frequencies of
 * the allele in the breeding population, which is what we need to calculate the next generation.
 * @param locus Locus that is being selected for
 * @param alleleFrequencies The current frequencies of the allele in the population
 * @returns Frequencies of the allele in the breeding population (as opposed to the original total population)
 */
export function resolveNaturalSelection(
  locus: Locus,
  alleleFrequencies: Float64Array,
  alleleToIndexMap: Map<Allele["id"], number>,
): Float64Array {
  // ensure that when we map this out that the frequency array is sorted in the same order as the incoming frequency map
  const fitnessValues = new Float32Array(locus.alleles.length);
  for (const allele of locus.alleles) {
    const targetIndex = alleleToIndexMap.get(allele.id);
    if (targetIndex !== undefined) {
      fitnessValues[targetIndex] = allele.fitnessModifier;
    }
  }
  const totalFitness = alleleFrequencies.reduce(
    (total, freq, index) => total + freq * fitnessValues[index],
    0,
  );

  if (totalFitness === 0) {
    // If total fitness is zero, we can't apply selection. This could happen if all alleles have a fitness modifier of 0.
    throw new Error(
      `Total fitness is zero for locus ${locus.label}. Cannot apply natural selection.`,
    );
  }
  const updatedFrequencies = new Float64Array(alleleFrequencies.length);
  for (let i = 0; i < alleleFrequencies.length; i++) {
    updatedFrequencies[i] =
      (alleleFrequencies[i] * fitnessValues[i]) / totalFitness;
  }
  return updatedFrequencies;
}
