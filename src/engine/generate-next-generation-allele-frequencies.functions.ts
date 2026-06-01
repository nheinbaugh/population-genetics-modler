import type { Allele } from "../models/core/allele.interface";

function generateLocusCdf(alleleFrequencies: Float64Array): Float64Array {
	const cumulativeFrequencies = new Float64Array(alleleFrequencies.length);
	alleleFrequencies.reduce((acc, freq, index) => {
		cumulativeFrequencies[index] = acc + freq;
		return cumulativeFrequencies[index];
	}, 0);
	return cumulativeFrequencies;
}

/**
 * Given the expected frequency rate and the population size we determine what the actual frequency is in the next generation.
 * @param postMutationFrequencies The frequency of alleles that mathematically should be present in the population
 * @param alleleToIndexMap Key Map to correctly find the frequency of a given allele
 * @param populationSize Population size to be calculated for
 * @returns The actual allele frequency for the population in a keyed record by allele id.
 */
export function generateNextGenerationAlleleFrequencies(
	postMutationFrequencies: Float64Array,
	alleleToIndexMap: Map<Allele["id"], number>,
	populationSize: number,
): Record<Allele["id"], number> {
	// at this point we model the population
	// assuming they are diploid we double the population size (cuz each new child got an allele from their parent)
	const totalAllelesToSample = populationSize * 2;
	const nextGenCounts: number[] = new Array(
		postMutationFrequencies.length,
	).fill(0);

	// generate a cumulative distribution function for the alleles in this locus based on the post-mutation frequencies.
	// this is used to determine which allele will
	const cdf = generateLocusCdf(postMutationFrequencies);

	// Roll a random number for every single allele slot in the new generation
	// Notes
	// * this is slow (for very large popoulations)
	// * this isn't very testable
	// * This doesn't scale well if we go out to dozens of alleles in a locus
	// They are all fixable if we want to invest the time
	// use a seed based random number generate and make it deterministic (math.random is not easy to test)
	// apparently the "gold standard" is using binary search on the cdf
	// for very large populations we would want to use gaussian appromixation instead of rolling them all
	for (let roll = 0; roll < totalAllelesToSample; roll++) {
		const r = Math.random();
		for (
			let alleleIdx = 0;
			alleleIdx < postMutationFrequencies.length;
			alleleIdx++
		) {
			if (r <= cdf[alleleIdx]) {
				nextGenCounts[alleleIdx]++;
				break;
			}
		}
	}

	const nextGenFreqs: Float64Array = new Float64Array(nextGenCounts.length);
	for (let i = 0; i < nextGenCounts.length; i++) {
		nextGenFreqs[i] = nextGenCounts[i] / totalAllelesToSample;
	}
	const alleleDistribution: Record<Allele["id"], number> = {};
	alleleToIndexMap.forEach((index, alleleId) => {
		alleleDistribution[alleleId] = nextGenFreqs[index];
	});
	return alleleDistribution;
}
