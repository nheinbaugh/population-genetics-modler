import type { IndividualSimulationConfiguration } from "../../models/simulation/simulation.interface";
import { BaseSimulationEngine } from "./base-simulation.engine";

export class IndividualSimulationEngine extends BaseSimulationEngine {
	protected override readonly configuration: IndividualSimulationConfiguration;
	constructor(configuration: IndividualSimulationConfiguration) {
		super(configuration);
		this.configuration = configuration;
	}

	proceedToNextGeneration(): void {}
}
