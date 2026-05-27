import type { Allele } from "../core/allele.interface";
import type { Locus } from "../core/locus.interface";
import type { SimulationConfiguration } from "./simulation.interface";

export interface ActiveSimulation {
	configuration: SimulationConfiguration;

	currentState: GenerationSnapshot;

	/**
	 * Array of all generations where initial population (aka Gen0) is at array position 0 and all
	 * subsequent generations are at the expected array postion
	 */
	previousGenerations: GenerationSnapshot[];
}

export interface LocusSnapshot {
	locusId: Locus["id"];
	isLocusFixed: boolean;
	alleleDistribution: Record<Allele["id"], number>;
}

export interface GenerationSnapshot {
	generationNumber: number;

	populationSize: number;
	lociSnapshots: Record<Locus["id"], LocusSnapshot>;
}
