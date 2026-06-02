import type { SimulationConfiguration } from "../models/simulation/simulation.interface";
import type { SimulationEngine } from "./simulation-engine.type";
import { IndividualSimulationEngine } from "./types/individual-simulation.engine";
import { PopulationSimulationEngine } from "./types/population-simulation.engine";

export function simulationEngineFactory(
  configuration: SimulationConfiguration,
): SimulationEngine {
  switch (configuration.strategy) {
    case "population": {
      return new PopulationSimulationEngine(configuration);
    }
    case "individual": {
      return new IndividualSimulationEngine(configuration);
    }
    default: {
      const _exhaustiveCheck: never = configuration;
      throw new Error(
        `Cannot create Engine for unknown strategy type: ${_exhaustiveCheck} `,
      );
    }
  }
}
