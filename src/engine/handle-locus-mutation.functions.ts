import type { Allele } from "../models/core/allele.interface";
import type { Locus } from "../models/core/locus.interface";

function handleAlleleMutation(
	originalFrequencies: Float64Array,
	updatedFrequencies: Float64Array,
	allele: Allele,
	locus: Locus,
	alleleToIndexMap: Map<Allele["id"], number>,
): Float64Array {
	const alleleIndex = alleleToIndexMap.get(allele.id);
	if (alleleIndex === undefined) {
		throw new Error(
			`Unable to find index for allele ${allele.label} in locus ${locus.label}`,
		);
	}
	const mutationMatrix = locus.mutationMatrix.find(
		(mutationConfig) => mutationConfig.fromAlleleId === allele.id,
	);
	if (!mutationMatrix) {
		// if there's no mutation configuration for this allele, we can just carry over the frequency
		return updatedFrequencies;
	}
	// calculate how many of the current allele mutate to other alleles
	mutationMatrix.mutationRates.forEach((mutationRate) => {
		const toAlleleIndex = alleleToIndexMap.get(mutationRate.toAlleleId);
		if (toAlleleIndex === undefined) {
			throw new Error(
				`Unable to find index for allele with id ${mutationRate.toAlleleId} in locus ${locus.label}`,
			);
		}
		const amountMutated =
			originalFrequencies[alleleIndex] * mutationRate.rateOfMutation;
		updatedFrequencies[toAlleleIndex] += amountMutated; // all the stuff that went from this allele to others is added to those frequencies
		updatedFrequencies[alleleIndex] -= amountMutated; // all the stuff that mutated out we want to remove from these counts.
	});
	return updatedFrequencies;
}

/**
 * This function takes the allele frequencies of a Locus in the current breeding population and determines
 * how many of them would have mutated into another allele based on the given mutation rates.
 */
export function handleLocusMutations(
	currentFrequencies: Float64Array,
	locus: Locus,
	alleleToIndexMap: Map<Allele["id"], number>,
): Float64Array {
	const updatedFrequencies = new Float64Array(currentFrequencies.length);
	// set the updated frequency baseline to be the pre-mutation frequency.
	currentFrequencies.forEach((frequency, index) => {
		updatedFrequencies[index] = frequency;
	});
	locus.alleles.forEach((allele) => {
		handleAlleleMutation(
			currentFrequencies,
			updatedFrequencies,
			allele,
			locus,
			alleleToIndexMap,
		);
	});
	return updatedFrequencies;
}
