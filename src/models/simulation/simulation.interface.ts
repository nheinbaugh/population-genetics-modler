import type { Locus } from "../core/locus.interface";
import type { SimulationStrategy } from "./simulation-strategy.enum";

interface BaseSimulationConfiguration {
  initialPopulationSize: number;

  /**
   * Controls whether the population size fluctuates between generations.
   */
  isPopulationSizeStatic: boolean;

  /**
   * Number of generations that should be simulated.
   */
  generations: number;

  /**
   * The loci that will be modleled as part of the experiment.
   */
  modeledLoci: Locus[];

  /**
   * The strategy that will be followed.
   */
  strategy: SimulationStrategy;
}

/**
 * This is the classic population level way of simulating the distribution throughout a population.
 *
 * We are concerned only with, for example, Locus A(allele:12) has a representation of 25% of the population. For tracking
 */
export interface PopulationSimulationConfiguration
  extends BaseSimulationConfiguration {
  strategy: "population";
}

/** A currently unsupported way of tracking individuals within the population */
export interface IndividualSimulationConfiguration
  extends BaseSimulationConfiguration {
  strategy: "individual";
  genderDistribution: {
    male: number;
    female: number;
  };
}

export type SimulationConfiguration =
  | PopulationSimulationConfiguration
  | IndividualSimulationConfiguration;
