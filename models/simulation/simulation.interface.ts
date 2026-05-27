import type { Locus } from "../core/locus.interface";

export interface SimulationConfiguration {
	initialPopulationSize: number;

	/**
	 * Controls whether the population size fluctuates between generations.
	 */
	isPopulationSizeStatic: boolean;
	generations: number;
	modeledLoci: Locus[];
} /**
 * This is the classic population level way of simulating the distribution throughout a population.
 *
 * We are concerned only with, for example, Locus A(allele:12) has a representation of 25% of the population. For tracking
 */
export interface PopulationSimulationConfiguration
	extends SimulationConfiguration {}

/** A currently unsupported way of tracking individuals within the population */
export interface IndividualSimulationConfiguration
	extends SimulationConfiguration {
	genderDistribution: {
		male: number;
		female: number;
	};
}
