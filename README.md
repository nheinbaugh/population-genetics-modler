# Population Genetics Sandbox
This project builds out a simulation engine that can track genetic distribution over the course of generations in a population. The first strategy implemented is based on the Wright-Fisher Model. Over time I will add more models and configuration options to increase the complexity.


## Features

### Generic Application Features/Concerns
[x] Basic Project Scaffolding
    [x] Linting/Code Quality **Biome**
    [x] Commit hooks
[] Persist Simulation Results


### Engine Layer
[x] Domain Model Creation
[-] Basic Wright-Fisher model
   [x] Macro Level implementation
   [] Micro Level (individual) engine model
[] TBD - future configurations etc that I need to relearn my population genetics for :)


### Application Layer
[x] Basic console sandbox to invoke the engine
[] Improve CLI or convert to TUI etc
[] React Application
    [] Simulation Configuration
    [] View Simulation Results

## Performance Improvements
[] Move from Math.random to some seeded approach for determinism
[] Offload logic to web worker
[] Offload to WebGPU

## Architectural Considerations
* Engine is fully decoupled from view layer concerns by remaining native TS
* Using Float64 instead of number to ensure that we keep high precision and don't continuously lose rounding errors
