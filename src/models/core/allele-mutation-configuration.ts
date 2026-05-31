import type { Allele } from "./allele.interface";

export interface AlleleMutationConfiguration {
	fromAlleleId: Allele["id"];
	/**
	 * Configuration of how often a given Allele will mutate into one of the other defined population alleles
	 */
	mutationRates: {
		toAlleleId: Allele["id"];
		rateOfMutation: number;
	}[];
}
