import type { Allele } from "./allele.interface";

export interface AlleleMutationConfiguration {
	sourceAlleleId: Allele["id"];
	/**
	 * Configuration of how often a given Allele will mutate into one of the other defined population alleles
	 */
	mutationRates: {
		mutatedAlleleId: Allele["id"];
		rateOfMutation: number;
	}[];
}
