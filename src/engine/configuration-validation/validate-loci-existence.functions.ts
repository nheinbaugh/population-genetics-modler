import type { Locus } from "../../models/core/locus.interface";
import { ConfigurationValidationError } from "./configuration-validation.error";

export function validateLociExistence(modeledLoci: Locus[]): void {
  if (modeledLoci.length === 0) {
    throw new ConfigurationValidationError(`Locus configuration does not include any loci`);
  }
}
