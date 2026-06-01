import { simulationEngineFactory } from "../engine/population-simulation.factory";
import type { SimulationConfiguration } from "../models/simulation/simulation.interface";

const configuration: SimulationConfiguration = {
	isPopulationSizeStatic: true,
	initialPopulationSize: 2000,
	strategy: "population",
	generations: 100,
	modeledLoci: [
		{
			id: "locus|a",
			label: "Basic Allele",
			mutationMatrix: [
				{
					fromAlleleId: "allele|a",
					mutationRates: [
						{
							toAlleleId: "allele|b",
							rateOfMutation: 0.25,
						},
					],
				},
				{
					fromAlleleId: "allele|b",
					mutationRates: [
						{
							toAlleleId: "allele|a",
							rateOfMutation: 0.01,
						},
					],
				},
			],
			alleles: [
				{
					id: "allele|a",
					label: "a",
					initialFrequency: 0.8,
					fitnessModifier: 1.5,
				},
				{
					id: "allele|b",
					label: "b",
					initialFrequency: 0.2,
					fitnessModifier: 1,
				},
			],
		},
	],
};

const simulation = simulationEngineFactory(configuration);
const state = simulation.simulationState;
console.log(JSON.stringify(state));
console.log("Running simulation");
console.log(
	"current generation number: ",
	simulation.simulationState.currentState.generationNumber,
);
for (let i = 0; i < configuration.generations; i++) {
	simulation.proceedToNextGeneration();
}
console.log(JSON.stringify(simulation.simulationState.currentState));
