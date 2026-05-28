import type { Allele } from "../../models/core/allele.interface";
import type { Locus } from "../../models/core/locus.interface";
import type {
	ActiveSimulation,
	GenerationSnapshot,
	LocusSnapshot,
} from "../../models/simulation/active-simulation.interface";
import type { PopulationSimulationConfiguration } from "../../models/simulation/simulation.interface";
import { BaseSimulationEngine } from "./base-simulation.engine";

export class PopulationSimulationEngine extends BaseSimulationEngine {
	protected override readonly configuration: PopulationSimulationConfiguration;
	private simulation: ActiveSimulation;
	private _locusAlleleIndices: Map<Locus["id"], Map<Allele["id"], number>> =
		new Map();
	private _locusAlleleFrequencies: Map<Locus["id"], Float64Array> = new Map();

	constructor(configuration: PopulationSimulationConfiguration) {
		super(configuration);
		this.simulation = this._initializeSimulationState();
		this.configuration = configuration;
	}

	private _initializeSimulationState(): ActiveSimulation {
		this.configuration.modeledLoci.forEach((locus) => {
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

	proceedToNextGeneration(): void {
		// placeholder
	}
}
