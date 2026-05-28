import type { SimulationConfiguration } from "../../models/simulation/simulation.interface";

export abstract class BaseSimulationEngine {
	protected readonly configuration: SimulationConfiguration;
	constructor(configuration: SimulationConfiguration) {
		this.configuration = configuration;
	}
	abstract proceedToNextGeneration(): void;
}
