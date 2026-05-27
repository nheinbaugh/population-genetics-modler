import type { Locus } from "../core/locus.interface";

export enum SimulationStrategy {
	Population = "population",
	Individual = "individual",
}

interface BaseSimulationConfiguration {
	initialPopulationSize: number;

	/**
	 * Controls whether the population size fluctuates between generations.
	 */
	isPopulationSizeStatic: boolean;
	generations: number;
	modeledLoci: Locus[];
	strategy: SimulationStrategy;
} /**
 * This is the classic population level way of simulating the distribution throughout a population.
 *
 * We are concerned only with, for example, Locus A(allele:12) has a representation of 25% of the population. For tracking
 */
export interface PopulationSimulationConfiguration
	extends BaseSimulationConfiguration {
	strategy: SimulationStrategy.Population;
}

/** A currently unsupported way of tracking individuals within the population */
export interface IndividualSimulationConfiguration
	extends BaseSimulationConfiguration {
	strategy: SimulationStrategy.Individual;
	genderDistribution: {
		male: number;
		female: number;
	};
}

export type SimulationConfiguration =
	| PopulationSimulationConfiguration
	| IndividualSimulationConfiguration;
