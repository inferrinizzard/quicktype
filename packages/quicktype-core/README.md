# quicktype-core

This package is the core logic that processes the given schema from a known input type into an Internal Representation and then formats it into the specified output in the target language.

## Process

The steps of the process are as follows:

### 1. exposed command

The exposed commands `quicktype`, `quicktypeMultiFile` both call the async `run` method from the `Run` runner class, while the `quicktypeMultiFileSync` calls the sync `runSync` method of the same class

### 2. `Run`

The `Run` class contains the main flow for running the quicktype generator as well as several util methods for debugging and instantiating default options.
The main methods to perform the schema generation are `run` and `runSync`, which each have 3 parts:

a. [prerun](#3-prerun)

b. [Type Graph Building](#4-type-graph-building)

c. [Type Graph Rendering](#5-type-graph-rendering)

### 3. prerun

Before each run, the prerun method will run the following steps:

-   generate random names for schema inputs that lack given names

-   instantiate the `TargetLanguage` class with the given options (either string name of known language or custom `TargetLanguage`)

-   handle the trivial case if input data does not need IR or output to schema instead of a language

### 4. Type Graph Building

Similar to `run` and `runSync`, the main method to read inputs and assemble the internal type graph also comes in sync and async coloured version: `makeGraph` and `makeGraphSync` to support sync and async input sources.

After input data is added, the following logic to process and flatten the graph is identical:

#### 4.1. Removing indirection intersections

#### 4.2. Resolving intersections and unions

#### 4.3. Replacing object types

#### 4.4. Clean up any new unions

#### 4.5. Combining classes

#### 4.6. Inferring maps

#### 4.7. Expanding strings and enums

#### 4.8. Clean up any new unions

#### 4.9. Flattening strings

#### 4.10. Replace none with any

#### 4.11. Replace optional with nullable

#### 4.12. Rewrite fixed points

#### 4.13. Make any necessary transformations

#### 4.14. Clean up any new unions

#### 4.15. Garbage Collection

#### 4.16. Gather names

### 5. Type Graph Rendering

Once the type graph is built, it is passed into each `TargetLanguage` class to render and serialize into the corresponding syntax for each language's respective structures.

This process varies depending on each `TargetLanguage` and `Renderer` class but generally starts with postprocessing the IR graph, if needed, then emitting 1 or more top-level source structures and recursing down for each block or sub-structure as the language requires.
