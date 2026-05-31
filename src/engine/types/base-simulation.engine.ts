import type { ActiveSimulation } from "../../models/simulation/active-simulation.interface";
import type { SimulationConfiguration } from "../../models/simulation/simulation.interface";

export abstract class BaseSimulationEngine {
	protected readonly configuration: SimulationConfiguration;
	protected declare simulation: ActiveSimulation;
	constructor(configuration: SimulationConfiguration) {
		this.configuration = configuration;
	}

	get simulationState(): ActiveSimulation {
		return this.simulation;
	}

	abstract proceedToNextGeneration(): void;
}
