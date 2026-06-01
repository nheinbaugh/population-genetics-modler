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

export class PopulationSimulationEngine extends BaseSimulationEngine {
	protected override readonly configuration: PopulationSimulationConfiguration;

	// This has the frequency of each allele in a given locus, but it's a flat array of just values for each locus
	private _locusAlleleFrequencies: Map<Locus["id"], Float64Array> = new Map();

	// we use this to know which index item in the _locusAlleleFrequencies map corresponds to a given allele
	// this means that our worst case is a O(2) to grab the frequency.
	private _locusAlleleIndices: Map<Locus["id"], Map<Allele["id"], number>> =
		new Map();

	constructor(configuration: PopulationSimulationConfiguration) {
		super(configuration);
		this.configuration = configuration;
		this.simulation = this._initializeSimulationState(configuration);
	}

	private _initializeSimulationState(
		configuration: PopulationSimulationConfiguration,
	): ActiveSimulation {
		configuration.modeledLoci.forEach((locus) => {
			const alleleToIndexMap = new Map<Allele["id"], number>();
			const alleleFrequencies = new Float64Array(locus.alleles.length);

			locus.alleles.forEach((allele, index) => {
				alleleToIndexMap.set(allele.id, index);
				alleleFrequencies[index] = allele.initialFrequency;
			});

			this._locusAlleleIndices.set(locus.id, alleleToIndexMap);
			this._locusAlleleFrequencies.set(locus.id, alleleFrequencies);
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
		const alleleFrequencies = this._locusAlleleFrequencies.get(locus.id);
		const alleleToIndexMap = this._locusAlleleIndices.get(locus.id);

		if (!alleleFrequencies || !alleleToIndexMap) {
			throw new Error(`Unable to find allele data for Locus ${locus.label}`);
		}
		// account for natural selection by multiplying frequency by fitness
		// normalize the new frequencies to add up to 1
		const breedingPopulationRates = resolveNaturalSelection(
			locus,
			alleleFrequencies,
			alleleToIndexMap,
		);

		// account for mutations
		const postMutationFrequencies = handleLocusMutations(
			breedingPopulationRates,
			locus,
			alleleToIndexMap,
		);

		const alleleDistribution = generateNextGenerationAlleleFrequencies(
			postMutationFrequencies,
			alleleToIndexMap,
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
			const alleleFrequencies = this._locusAlleleFrequencies.get(locus.id);
			const alleleToIndexMap = this._locusAlleleIndices.get(locus.id);

			if (!alleleFrequencies || !alleleToIndexMap) {
				throw new Error(`Unable to find allele data for Locus ${locus.label}`);
			}
			alleleToIndexMap.forEach((index, alleleId) => {
				alleleDistribution[alleleId] = alleleFrequencies[index];
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
