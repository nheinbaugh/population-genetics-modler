import type { Allele } from "../../models/core/allele.interface";

/**
 * This maps the ID of an allele to its index in a paired Frequency array for a locus.
 */
export type AlleleIndexMap = Map<Allele["id"], number>;
