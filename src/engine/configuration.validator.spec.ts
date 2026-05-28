import { describe, expect, test } from "vitest";
import type { SimulationConfiguration } from "../models/simulation/simulation.interface";
import { validateSimulationConfiguration } from "./configuration-validation";
import { ConfigurationValidationError } from "./configuration-validation/configuration-validation.error";

describe("validateSimulationConfiguration", () => {
	describe("validateLocusExistance", () => {
		test("it should throw an error when there are no alleles in a locus", () => {
			const config: SimulationConfiguration = {
				isPopulationSizeStatic: true,
				initialPopulationSize: 200,
				strategy: "population",
				generations: 10,
				modeledLoci: [],
			};
			expect(() => validateSimulationConfiguration(config)).toThrow();
		});
	});

	describe("validateLocusFrequencies", () => {
		test("it should throw an error when the sum of alleles for a locus is less than 1", () => {
			const config: SimulationConfiguration = {
				isPopulationSizeStatic: true,
				initialPopulationSize: 200,
				strategy: "population",
				generations: 10,
				modeledLoci: [
					{
						id: "locus|a",
						label: "Basic Allele",
						mutationMatrix: [],
						alleles: [
							{
								id: "allele|a",
								label: "a",
								initialFrequency: 0.2,
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
			expect(() => validateSimulationConfiguration(config)).toThrow(
				ConfigurationValidationError,
			);
		});

		test("it should throw an error when the sum of alleles for a locus is more than 1", () => {
			const config: SimulationConfiguration = {
				isPopulationSizeStatic: true,
				initialPopulationSize: 200,
				strategy: "population",
				generations: 10,
				modeledLoci: [
					{
						id: "locus|a",
						label: "Basic Allele",
						mutationMatrix: [],
						alleles: [
							{
								id: "allele|a",
								label: "a",
								initialFrequency: 0.2,
								fitnessModifier: 1,
							},
							{
								id: "allele|b",
								label: "b",
								initialFrequency: 0.9,
								fitnessModifier: 1,
							},
						],
					},
				],
			};
			expect(() => validateSimulationConfiguration(config)).toThrow(
				ConfigurationValidationError,
			);
		});

		test("it should not throw an error when the sum of alleles for a loucs is 1", () => {
			const config: SimulationConfiguration = {
				isPopulationSizeStatic: true,
				initialPopulationSize: 200,
				strategy: "population",
				generations: 10,
				modeledLoci: [
					{
						id: "locus|a",
						label: "Basic Allele",
						mutationMatrix: [],
						alleles: [
							{
								id: "allele|a",
								label: "a",
								initialFrequency: 0.75,
								fitnessModifier: 1,
							},
							{
								id: "allele|b",
								label: "b",
								initialFrequency: 0.25,
								fitnessModifier: 1,
							},
						],
					},
				],
			};
			expect(() => validateSimulationConfiguration(config)).not.toThrow(
				ConfigurationValidationError,
			);
		});
	});
});
