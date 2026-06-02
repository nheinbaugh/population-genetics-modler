import type { Allele } from "./allele.interface";
import type { AlleleMutationConfiguration } from "./allele-mutation-configuration";

/**
 * This is a group of Alleles that are being monitored as part of the simulation.
 *
 * The sum of all alleleFrequency of the all Alleles in a Locus must be 1
 */
export interface Locus {
  id: string;
  label: string;
  alleles: Allele[];
  mutationMatrix: AlleleMutationConfiguration[];
}
