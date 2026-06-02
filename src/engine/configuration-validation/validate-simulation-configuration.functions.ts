import type { SimulationConfiguration } from "../../models/simulation/simulation.interface";
import { validateLociExistence } from "./validate-loci-existence.functions";
import { validateLocusFrequencies } from "./validate-locus-frequencies.functions";
import { validateMutationAlleleIds } from "./validate-locus-mutation-matrix.functions";

export function validateSimulationConfiguration(
  configuration: SimulationConfiguration,
): void {
  validateLociExistence(configuration.modeledLoci);
  validateLocusFrequencies(configuration.modeledLoci);
  validateMutationAlleleIds(configuration.modeledLoci);
}
