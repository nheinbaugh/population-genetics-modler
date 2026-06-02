import type { AlleleIndexMap } from "./allele-index-map";

/**
 * Data structure that contains a flat array of allele frequencies along with a map that points to the correct index of a given allele in that array.
 */
export interface LocusAlleleData {
  indicies: AlleleIndexMap;
  frequencies: Float64Array;
}
