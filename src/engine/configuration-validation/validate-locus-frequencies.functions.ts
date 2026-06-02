import { EPSILON } from "../../models/core/epsilon.const";
import type { Locus } from "../../models/core/locus.interface";
import { ConfigurationValidationError } from "./configuration-validation.error";

export function validateLocusFrequencies(modeledLoci: Locus[]): void {
  modeledLoci.forEach((locus) => {
    const sumOfFrequencies = locus.alleles.reduce(
      (sum, allele) => sum + allele.initialFrequency,
      0,
    );

    if (Math.abs(sumOfFrequencies - 1.0) > EPSILON) {
      throw new ConfigurationValidationError(
        `Locus '${locus.label}' (ID: ${locus.id}) has allele initial frequencies that do not sum to 1.0. Current sum: ${sumOfFrequencies}`,
      );
    }
  });
}
