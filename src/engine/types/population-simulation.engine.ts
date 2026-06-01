import type { Allele } from "../../models/core/allele.interface";
import type { Locus } from "../../models/core/locus.interface";
import type {
	ActiveSimulation,
	GenerationSnapshot,
	LocusSnapshot,
} from "../../models/simulation/active-simulation.interface";
import type { PopulationSimulationConfiguration } from "../../models/simulation/simulation.interface";
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

		// at this point we model the population
		// assuming they are diploid we double the population size (cuz each new child got an allele from their parent)
		const totalAllelesToSample =
			this.simulationState.currentState.populationSize * 2;
		const nextGenCounts: number[] = new Array(alleleFrequencies.length).fill(0);

		// generate a cumulative distribution function for the alleles in this locus based on the post-mutation frequencies.
		// this is used to determine which allele will
		const cdf = generateLocusCdf(postMutationFrequencies);

		// Roll a random number for every single allele slot in the new generation
		// Notes
		// * this is slow (for very large popoulations)
		// * this isn't very testable
		// * This doesn't scale well if we go out to dozens of alleles in a locus
		// They are all fixable if we want to invest the time
		// use a seed based random number generate and make it deterministic (math.random is not easy to test)
		// apparently the "gold standard" is using binary search on the cdf
		// for very large populations we would want to use gaussian appromixation instead of rolling them all
		for (let roll = 0; roll < totalAllelesToSample; roll++) {
			const r = Math.random();
			for (
				let alleleIdx = 0;
				alleleIdx < alleleFrequencies.length;
				alleleIdx++
			) {
				if (r <= cdf[alleleIdx]) {
					nextGenCounts[alleleIdx]++;
					break;
				}
			}
		}

		const nextGenFreqs: Float64Array = new Float64Array(nextGenCounts.length);
		for (let i = 0; i < nextGenCounts.length; i++) {
			nextGenFreqs[i] = nextGenCounts[i] / totalAllelesToSample;
		}
		const alleleDistribution: Record<Allele["id"], number> = {};
		alleleToIndexMap.forEach((index, alleleId) => {
			alleleDistribution[alleleId] = nextGenFreqs[index];
		});

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

function generateLocusCdf(alleleFrequencies: Float64Array): Float64Array {
	const cumulativeFrequencies = new Float64Array(alleleFrequencies.length);
	alleleFrequencies.reduce((acc, freq, index) => {
		cumulativeFrequencies[index] = acc + freq;
		return cumulativeFrequencies[index];
	}, 0);
	return cumulativeFrequencies;
}
