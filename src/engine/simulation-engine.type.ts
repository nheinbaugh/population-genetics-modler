import type { IndividualSimulationEngine } from "./types/individual-simulation.engine";
import type { PopulationSimulationEngine } from "./types/population-simulation.engine";

export type SimulationEngine =
  | PopulationSimulationEngine
  | IndividualSimulationEngine;
