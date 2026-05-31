import { simulationEngineFactory } from "../engine/population-simulation.factory";
import type { SimulationConfiguration } from "../models/simulation/simulation.interface";

console.log("hello world!, how are you doing?");
const configuration: SimulationConfiguration = {
	isPopulationSizeStatic: true,
	initialPopulationSize: 200,
	strategy: "population",
	generations: 10,
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
							rateOfMutation: 0.05,
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
					fitnessModifier: 1,
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
