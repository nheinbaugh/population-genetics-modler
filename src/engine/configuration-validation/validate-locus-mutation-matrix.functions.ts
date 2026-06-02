import type { Locus } from "../../models/core/locus.interface";
import { ConfigurationValidationError } from "./configuration-validation.error";

export function validateMutationAlleleIds(modeledLoci: Locus[]): void {
  modeledLoci.forEach((locus) => {
    const validAlleleIds = new Set(locus.alleles.map((a) => a.id));

    if (!locus.mutationMatrix || !locus.mutationMatrix.length) {
      throw new ConfigurationValidationError(
        `Locus with ID: ${locus.id} does not contain a mutation matrix'`,
      );
    }
    locus.mutationMatrix.forEach((mutationConfig) => {
      if (!validAlleleIds.has(mutationConfig.fromAlleleId)) {
        throw new ConfigurationValidationError(
          `Locus '${locus.label}' (ID: ${locus.id}) has a mutation configuration with an invalid sourceAlleleId: '${mutationConfig.fromAlleleId}'.`,
        );
      }
      mutationConfig.mutationRates.forEach((mutationRate) => {
        if (!validAlleleIds.has(mutationRate.toAlleleId)) {
          throw new ConfigurationValidationError(
            `Locus '${locus.label}' (ID: ${locus.id}) has a mutation configuration with an invalid mutatedAlleleId: '${mutationRate.toAlleleId}'.`,
          );
        }
        if (mutationRate.rateOfMutation < 0) {
          throw new ConfigurationValidationError(
            `Locus '${locus.label}' has a mutation configuration with a negative mutation rate`,
          );
        }
      });
    });
  });
}
