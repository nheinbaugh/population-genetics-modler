import type { Allele } from "../../models/core/allele.interface";
import type { Locus } from "../../models/core/locus.interface";
import type {
  ActiveSimulation,
  GenerationSnapshot,
  LocusSnapshot,
} from "../../models/simulation/active-simulation.interface";
import type { PopulationSimulationConfiguration } from "../../models/simulation/simulation.interface";
import { generateNextGenerationAlleleFrequencies } from "../generate-next-generation-allele-frequencies.functions";
import { handleLocusMutations } from "../handle-locus-mutation.functions";
import { resolveNaturalSelection } from "../resolve-natural-selection.functions";
import { BaseSimulationEngine } from "./base-simulation.engine";
import { createLocusAlleleData } from "./locus-allele-data.factory";
import type { LocusAlleleData } from "./locus-allele-data.interface";

export class PopulationSimulationEngine extends BaseSimulationEngine {
  protected override readonly configuration: PopulationSimulationConfiguration;

  private locusData: Map<Locus["id"], LocusAlleleData> = new Map();

  constructor(configuration: PopulationSimulationConfiguration) {
    super(configuration);
    this.configuration = configuration;
    this.simulation = this._initializeSimulationState(configuration);
  }

  private _initializeSimulationState(
    configuration: PopulationSimulationConfiguration,
  ): ActiveSimulation {
    configuration.modeledLoci.forEach((locus) => {
      this.locusData.set(locus.id, createLocusAlleleData(locus));
    });

    return this._createGenerationSnapshot(0);
  }

  proceedToNextGeneration(): void {
    const snapshot: GenerationSnapshot = {
      generationNumber: this.simulationState.currentState.generationNumber + 1,
      lociSnapshots: {}, // we'll fill this in after we evolve each locus
      populationSize: this.simulationState.currentState.populationSize,
    };
    for (const locus of this.configuration.modeledLoci) {
      snapshot.lociSnapshots[locus.id] = this.evolveLocus(locus);
    }
    this.simulation.previousGenerations.push(this.simulation.currentState);
    this.simulation.currentState = snapshot;
  }

  private evolveLocus(locus: Locus): LocusSnapshot {
    const alleleData = this.locusData.get(locus.id);
    if (!alleleData) {
      throw new Error(`Unable to find allele data for Locus ${locus.label}`);
    }

    // account for natrual selection against the current generation.
    const breedingPopulationRates = resolveNaturalSelection(locus, alleleData);

    // account for mutations as the alleles are passed from the current generation to the next generation
    const postMutationFrequencies = handleLocusMutations(
      breedingPopulationRates,
      locus,
      alleleData.indicies,
    );

    // use the updated frequencies to determine the makeup of the next generation
    const alleleDistribution = generateNextGenerationAlleleFrequencies(
      postMutationFrequencies,
      alleleData.indicies,
      this.simulationState.currentState.populationSize,
    );

    return {
      locusId: locus.id,
      alleleDistribution,
      isLocusFixed: false,
    };
  }

  private _createGenerationSnapshot(
    generationNumber: number,
  ): ActiveSimulation {
    const lociSnapshots: GenerationSnapshot["lociSnapshots"] = {};
    this.configuration.modeledLoci.forEach((locus) => {
      const alleleDistribution: Record<Allele["id"], number> = {};
      const alleleData = this.locusData.get(locus.id);
      if (!alleleData) {
        throw new Error(`Unable to find allele data for Locus ${locus.label}`);
      }
      alleleData.indicies.forEach((index, alleleId) => {
        alleleDistribution[alleleId] = alleleData.frequencies[index];
      });

      const currentLocusSnapshot: LocusSnapshot = {
        locusId: locus.id,
        alleleDistribution,
        isLocusFixed: false, // This will be calculated later
      };
      lociSnapshots[locus.id] = currentLocusSnapshot;
    });

    const currentGeneration: GenerationSnapshot = {
      generationNumber,
      lociSnapshots,
      populationSize: this.configuration.initialPopulationSize,
    };

    return {
      previousGenerations: [currentGeneration],
      currentState: currentGeneration,
      configuration: this.configuration,
    };
  }
}
