import { describe, expect, test } from "vitest";
import type { Allele } from "../models/core/allele.interface";
import { resolveNaturalSelection } from "./resolve-natural-selection.functions";

describe("resolveNaturalSelection", () => {
	test("should correctly handle when alleles are not ordered in the frequency array", () => {
		const locus = {
			id: "locus|a",
			label: "Basic Allele",
			mutationMatrix: [
				{
					fromAlleleId: "allele|a",
					mutationRates: [
						{
							toAlleleId: "allele|b",
							rateOfMutation: 0.2,
						},
					],
				},
			],
			alleles: [
				{
					id: "allele|a",
					label: "a",
					initialFrequency: 0.2,
					fitnessModifier: 0.9,
				},
				{
					id: "allele|b",
					label: "b",
					initialFrequency: 0.2,
					fitnessModifier: 1,
				},
			],
		};
		const alleleFrequencies = new Float64Array([0.2, 0.8]);
		const indexMap: Map<Allele["id"], number> = new Map()
			.set("allele|a", 1)
			.set("allele|b", 0);
		const result = resolveNaturalSelection(locus, alleleFrequencies, indexMap);
		expect(alleleFrequencies[0]).toBeGreaterThan(result[0]);
		expect(alleleFrequencies[1]).toBeLessThan(result[1]);
	});
	test("should return the same frequencies when all fitness modifiers are 1", () => {
		const locus = {
			id: "locus|a",
			label: "Basic Allele",
			mutationMatrix: [
				{
					fromAlleleId: "allele|a",
					mutationRates: [
						{
							toAlleleId: "allele|b",
							rateOfMutation: 0.2,
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
		};
		const alleleFrequencies = new Float64Array([0.5, 0.5]);
		const indexMap: Map<Allele["id"], number> = new Map()
			.set("allele|a", 0)
			.set("allele|b", 1);

		const result = resolveNaturalSelection(locus, alleleFrequencies, indexMap);
		expect(result).toEqual(alleleFrequencies);
	});

	test("new frequencies should sum to 1", () => {
		const locus = {
			id: "locus|a",
			label: "Basic Allele",
			mutationMatrix: [
				{
					fromAlleleId: "allele|a",
					mutationRates: [
						{
							toAlleleId: "allele|b",
							rateOfMutation: 0.2,
						},
					],
				},
			],
			alleles: [
				{
					id: "allele|a",
					label: "a",
					initialFrequency: 0.3,
					fitnessModifier: 0.9,
				},
				{
					id: "allele|b",
					label: "b",
					initialFrequency: 0.7,
					fitnessModifier: 1,
				},
			],
		};

		const alleleFrequencies = new Float64Array([0.4, 0.6]);
		const indexMap: Map<Allele["id"], number> = new Map()
			.set("allele|a", 0)
			.set("allele|b", 1);
		const result = resolveNaturalSelection(locus, alleleFrequencies, indexMap);
		expect(alleleFrequencies[0]).toBeGreaterThan(result[0]);
		expect(alleleFrequencies[1]).toBeLessThan(result[1]);
		expect(result.reduce((sum, freq) => sum + freq, 0)).toBeCloseTo(1);
	});

	test("should see a decrease in the frequency of an allele with a lower fitness number", () => {
		const locus = {
			id: "locus|a",
			label: "Basic Allele",
			mutationMatrix: [
				{
					fromAlleleId: "allele|a",
					mutationRates: [
						{
							toAlleleId: "allele|b",
							rateOfMutation: 0.2,
						},
					],
				},
			],
			alleles: [
				{
					id: "allele|a",
					label: "a",
					initialFrequency: 0.2,
					fitnessModifier: 0.9,
				},
				{
					id: "allele|b",
					label: "b",
					initialFrequency: 0.2,
					fitnessModifier: 1,
				},
			],
		};
		const alleleFrequencies = new Float64Array([0.5, 0.5]);
		const indexMap: Map<Allele["id"], number> = new Map()
			.set("allele|a", 0)
			.set("allele|b", 1);
		const result = resolveNaturalSelection(locus, alleleFrequencies, indexMap);
		expect(alleleFrequencies[0]).toBeGreaterThan(result[0]);
		expect(alleleFrequencies[1]).toBeLessThan(result[1]);
	});

	test("should return frequencies that sum to 1", () => {
		const locus = {
			id: "locus|a",
			label: "Basic Allele",
			mutationMatrix: [
				{
					fromAlleleId: "allele|a",
					mutationRates: [
						{
							toAlleleId: "allele|b",
							rateOfMutation: 0.2,
						},
					],
				},
			],
			alleles: [
				{
					id: "allele|a",
					label: "a",
					initialFrequency: 0.8,
					fitnessModifier: 0.8,
				},
				{
					id: "allele|b",
					label: "b",
					initialFrequency: 0.2,
					fitnessModifier: 1,
				},
			],
		};
		const alleleFrequencies = new Float64Array([0.5, 0.5]);
		const indexMap: Map<Allele["id"], number> = new Map()
			.set("allele|a", 0)
			.set("allele|b", 1);

		const result = resolveNaturalSelection(locus, alleleFrequencies, indexMap);

		expect(result.reduce((sum, freq) => sum + freq, 0)).toBeCloseTo(1);
		expect(alleleFrequencies[0]).not.toEqual(result[0]);
	});

	test("should throw an error when all fitness modifiers are 0", () => {
		const locus = {
			id: "locus|a",
			label: "Basic Allele",
			mutationMatrix: [
				{
					fromAlleleId: "allele|a",
					mutationRates: [
						{
							toAlleleId: "allele|b",
							rateOfMutation: 0.2,
						},
					],
				},
			],
			alleles: [
				{
					id: "allele|a",
					label: "a",
					initialFrequency: 0.8,
					fitnessModifier: 0,
				},
				{
					id: "allele|b",
					label: "b",
					initialFrequency: 0.2,
					fitnessModifier: 0,
				},
			],
		};
		const alleleFrequencies = new Float64Array([0.5, 0.5]);
		const indexMap: Map<Allele["id"], number> = new Map()
			.set("allele|a", 0)
			.set("allele|b", 1);

		expect(() =>
			resolveNaturalSelection(locus, alleleFrequencies, indexMap),
		).toThrow();
	});
});
