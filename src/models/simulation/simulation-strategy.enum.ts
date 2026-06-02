export const SimulationStrategy = {
  Population: "population",
  Individual: "individual",
} as const;

export type SimulationStrategy =
  (typeof SimulationStrategy)[keyof typeof SimulationStrategy];
