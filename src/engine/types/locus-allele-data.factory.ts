import type { Allele } from "../../models/core/allele.interface";
import type { Locus } from "../../models/core/locus.interface";
import type { AlleleIndexMap } from "./allele-index-map";
import type { LocusAlleleData } from "./locus-allele-data.interface";

export function createLocusAlleleData(locus: Locus): LocusAlleleData {
  const alleleToIndexMap: AlleleIndexMap = new Map<Allele["id"], number>();
  const alleleFrequencies = new Float64Array(locus.alleles.length);

  locus.alleles.forEach((allele, index) => {
    alleleToIndexMap.set(allele.id, index);
    alleleFrequencies[index] = allele.initialFrequency;
  });

  return {
    indicies: alleleToIndexMap,
    frequencies: alleleFrequencies,
  };
}
