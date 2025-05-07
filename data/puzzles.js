// Export an array of puzzles
export const puzzles = [
    // 1. Carbon Intake & Capture (01 of 09)
    {
        componentName: "Carbon Intake & Capture",
        initialMessage: `
> COMPONENT FAILURE: Carbon Intake & Capture System
> SYSTEM STATUS: OFFLINE
> FUNCTION: Atmospheric CO₂ collection using ionized air vacuums and nano-filtration membranes

The Carbon Intake & Capture system has failed. This is the first stage of the reactor process, 
responsible for drawing in atmospheric carbon dioxide and filtering it for processing.

To repair this component, locate and enter the correct passphrase.
`,
        passphrase: "capturecarbon", // This would be discovered through a physical puzzle
        successMessage: `
> PROCESSING PASSPHRASE...
> ACCESS GRANTED
> INITIATING SYSTEM REPAIR...
> RECALIBRATING NANO-FILTRATION MEMBRANES
> REACTIVATING IONIZED AIR VACUUMS
> CARBON INTAKE & CAPTURE: ONLINE

Component successfully repaired. Carbon intake levels returning to optimal range.
Proceeding to next component...
`,
        hints: [
            "Look for clues related to the carbon capture process. The passphrase might be hidden in plain sight.",
            "Examine any filtration or vacuum-related objects in the room. The passphrase could be revealed by arranging components correctly.",
            "The passphrase is two words combined: 'capture' and 'carbon'."
        ]
    },

    // 2. Molecular Disassembly (02 of 09) - Sorting Puzzle
    {
        componentName: "Molecular Disassembly",
        initialMessage: `
> COMPONENT FAILURE: Molecular Disassembly Unit
> SYSTEM STATUS: OFFLINE
> FUNCTION: Breaking down CO₂ into carbon and oxygen atoms using high-frequency lasers and quantum resonance fields

The Molecular Disassembly unit has malfunctioned. This critical component separates carbon dioxide 
molecules into their constituent parts for further processing.

Diagnostic shows data sorting error. Molecular elements must be properly categorized to restore system function.
Use the terminal interface to sort the elements into their proper categories.

INSTRUCTION: Drag and drop each element into its correct category.
`,
        passphrase: "splitco2", // This would be discovered by solving the sorting puzzle
        successMessage: `
> PROCESSING PASSPHRASE...
> ACCESS GRANTED
> INITIATING SYSTEM REPAIR...
> RECALIBRATING QUANTUM RESONANCE FIELDS
> REACTIVATING HIGH-FREQUENCY LASERS
> MOLECULAR DISASSEMBLY: ONLINE

Component successfully repaired. Molecular breakdown process resuming at optimal efficiency.
Proceeding to next component...
`,
        hints: [
            "Look at the properties of each element to determine which category it belongs to.",
            "Pay attention to the revealed characters as you complete each category.",
            "The passphrase is related to the function of breaking apart CO₂."
        ],
        // Sorting puzzle specific data
        puzzleType: "sorting",
        sortingData: {
            instructions: "Sort the molecular elements into their correct categories to reveal the system passphrase.",
            categories: [
                {
                    name: "Metals",
                    revealedCharacters: "SPLIT",
                    items: []
                },
                {
                    name: "Gases",
                    revealedCharacters: "CO",
                    items: []
                },
                {
                    name: "Compounds",
                    revealedCharacters: "2",
                    items: []
                }
            ],
            items: [
                { id: "item1", name: "Iron", category: "Metals", description: "Fe - Atomic number 26" },
                { id: "item2", name: "Oxygen", category: "Gases", description: "O - Atomic number 8" },
                { id: "item3", name: "Sodium Chloride", category: "Compounds", description: "NaCl - Salt" },
                { id: "item4", name: "Copper", category: "Metals", description: "Cu - Atomic number 29" },
                { id: "item5", name: "Hydrogen", category: "Gases", description: "H - Atomic number 1" },
                { id: "item6", name: "Carbon Dioxide", category: "Compounds", description: "CO2 - Greenhouse gas" },
                { id: "item7", name: "Gold", category: "Metals", description: "Au - Atomic number 79" },
                { id: "item8", name: "Helium", category: "Gases", description: "He - Atomic number 2" },
                { id: "item9", name: "Water", category: "Compounds", description: "H2O - Essential for life" }
            ]
        }
    },

    // 3. Nuclear Energy Core Activation (03 of 09)
    {
        componentName: "Nuclear Energy Core",
        initialMessage: `
> COMPONENT FAILURE: Nuclear Energy Core
> SYSTEM STATUS: OFFLINE
> FUNCTION: Thorium-based molten salt reactor providing power for the facility

The Nuclear Energy Core has shut down. This component is the primary power source for the entire 
facility and must be reactivated to continue operations.

To repair this component, locate and enter the correct passphrase.
`,
        passphrase: "thoriumpower", // This would be discovered through a physical puzzle
        successMessage: `
> PROCESSING PASSPHRASE...
> ACCESS GRANTED
> INITIATING SYSTEM REPAIR...
> RESTABILIZING MOLTEN SALT MEDIUM
> REINITIATING THORIUM REACTION
> NUCLEAR ENERGY CORE: ONLINE

Component successfully repaired. Power generation returning to optimal levels.
Proceeding to next component...
`,
        hints: [
            "The reactor uses thorium as its fuel source. Look for periodic table references or atomic symbols in the room.",
            "Examine any power-related puzzles or equipment. The passphrase relates to the specific type of nuclear energy used.",
            "The passphrase combines 'thorium' with the word 'power'."
        ]
    },

    // 4. Isotopic Reformation (04 of 09)
    {
        componentName: "Isotopic Reformation",
        initialMessage: `
> COMPONENT FAILURE: Isotopic Reformation Chamber
> SYSTEM STATUS: OFFLINE
> FUNCTION: Rearrangement of carbon atoms through magnetic fields and neutron baths to create synthetic hydrocarbons

The Isotopic Reformation Chamber has malfunctioned. This component rearranges carbon atoms into 
useful molecular structures through quantum manipulation.

To repair this component, locate and enter the correct passphrase.
`,
        passphrase: "rearrangeatoms", // This would be discovered through a physical puzzle
        successMessage: `
> PROCESSING PASSPHRASE...
> ACCESS GRANTED
> INITIATING SYSTEM REPAIR...
> RECALIBRATING MAGNETIC FIELDS
> REACTIVATING NEUTRON BATHS
> ISOTOPIC REFORMATION: ONLINE

Component successfully repaired. Atomic restructuring operating at optimal parameters.
Proceeding to next component...
`,
        hints: [
            "The passphrase relates to reorganizing or restructuring atoms. Look for puzzles with movable parts that need rearrangement.",
            "Examine any magnetic objects or puzzles involving atomic structures. The concept of 'reorganizing' is key.",
            "The passphrase combines 'rearrange' with 'atoms'."
        ]
    },

    // 5. Cryogenic Carbon Storage (05 of 09)
    {
        componentName: "Cryogenic Carbon Storage",
        initialMessage: `
> COMPONENT FAILURE: Cryogenic Carbon Storage
> SYSTEM STATUS: OFFLINE
> FUNCTION: High-pressure storage of carbon in solid, nano-lattice form

The Cryogenic Carbon Storage system has failed. This component safely stores processed carbon 
in a stable, solid state using extreme cold and pressure.

To repair this component, locate and enter the correct passphrase.
`,
        passphrase: "freezecarbon", // This would be discovered through a physical puzzle
        successMessage: `
> PROCESSING PASSPHRASE...
> ACCESS GRANTED
> INITIATING SYSTEM REPAIR...
> RESTORING CRYOGENIC COOLING SYSTEM
> REESTABLISHING PRESSURE CONTAINMENT
> CRYOGENIC CARBON STORAGE: ONLINE

Component successfully repaired. Carbon storage capacity restored to optimal levels.
Proceeding to next component...
`,
        hints: [
            "The passphrase relates to the extreme cold used in this system. Look for temperature-related puzzles or clues.",
            "Examine any ice-related or cold-storage objects in the room. The concept of 'freezing' or 'cooling' is essential.",
            "The passphrase combines 'freeze' with 'carbon'."
        ]
    },

    // 6. Synthetic Fuel Fabrication (06 of 09)
    {
        componentName: "Synthetic Fuel Fabrication",
        initialMessage: `
> COMPONENT FAILURE: Synthetic Fuel Fabrication Unit
> SYSTEM STATUS: OFFLINE
> FUNCTION: Creation of carbon-neutral synthetic fuels by bonding processed carbon with hydrogen

The Synthetic Fuel Fabrication Unit has malfunctioned. This component combines processed carbon 
with hydrogen to create useful, carbon-neutral synthetic fuels.

To repair this component, locate and enter the correct passphrase.
`,
        passphrase: "createfuel", // This would be discovered through a physical puzzle
        successMessage: `
> PROCESSING PASSPHRASE...
> ACCESS GRANTED
> INITIATING SYSTEM REPAIR...
> RECALIBRATING MOLECULAR BONDING PROCESS
> REACTIVATING HYDROGEN INJECTION SYSTEM
> SYNTHETIC FUEL FABRICATION: ONLINE

Component successfully repaired. Fuel production resuming at optimal efficiency.
Proceeding to next component...
`,
        hints: [
            "The passphrase relates to the production or generation of fuel. Look for manufacturing or chemistry-related puzzles.",
            "Examine any fuel containers or hydrocarbon models in the room. The concept of 'creating' or 'synthesizing' is key.",
            "The passphrase combines 'create' with 'fuel'."
        ]
    },

    // 7. Closed-loop Energy Distribution (07 of 09)
    {
        componentName: "Closed-loop Energy Distribution",
        initialMessage: `
> COMPONENT FAILURE: Closed-loop Energy Distribution Network
> SYSTEM STATUS: OFFLINE
> FUNCTION: Distribution of synthetic fuel to surrounding systems with emissions feeding back into the N.R.R.C

The Closed-loop Energy Distribution Network has failed. This component ensures efficient 
energy use throughout the facility while recapturing emissions for reprocessing.

To repair this component, locate and enter the correct passphrase.
`,
        passphrase: "circleenergy", // This would be discovered through a physical puzzle
        successMessage: `
> PROCESSING PASSPHRASE...
> ACCESS GRANTED
> INITIATING SYSTEM REPAIR...
> RESTORING DISTRIBUTION PATHWAYS
> REACTIVATING EMISSION RECAPTURE SYSTEMS
> CLOSED-LOOP ENERGY DISTRIBUTION: ONLINE

Component successfully repaired. Energy circulation and emission recapture operating optimally.
Proceeding to next component...
`,
        hints: [
            "The passphrase relates to the cyclical nature of this system. Look for circular patterns or loop diagrams in the room.",
            "Examine any puzzles involving circuits or flow patterns. The concept of a 'circle' or 'loop' is essential.",
            "The passphrase combines 'circle' with 'energy'."
        ]
    },

    // 8. Waste Reclamation & Reactor Cooling (08 of 09)
    {
        componentName: "Waste Reclamation & Cooling",
        initialMessage: `
> COMPONENT FAILURE: Waste Reclamation & Cooling System
> SYSTEM STATUS: OFFLINE
> FUNCTION: Heat recapture system converting waste heat into electricity or powering water purification

The Waste Reclamation & Cooling System has malfunctioned. This component manages excess heat 
from the reactor, converting it into additional electricity and purified water.

To repair this component, locate and enter the correct passphrase.
`,
        passphrase: "recycleheat", // This would be discovered through a physical puzzle
        successMessage: `
> PROCESSING PASSPHRASE...
> ACCESS GRANTED
> INITIATING SYSTEM REPAIR...
> REACTIVATING HEAT EXCHANGE SYSTEMS
> RESTORING WATER PURIFICATION PROCESS
> WASTE RECLAMATION & COOLING: ONLINE

Component successfully repaired. Heat reclamation and cooling systems operating at optimal efficiency.
Proceeding to final component...
`,
        hints: [
            "The passphrase relates to the reuse of waste heat. Look for thermal imagery or heat-related puzzles in the room.",
            "Examine any water or cooling system components. The concept of 'recycling' or 'reclaiming' is key.",
            "The passphrase combines 'recycle' with 'heat'."
        ]
    },

    // 9. AI-Controlled Ecosystem Balance (09 of 09)
    {
        componentName: "AI-Controlled Ecosystem",
        initialMessage: `
> COMPONENT FAILURE: AI-Controlled Ecosystem Balance
> SYSTEM STATUS: OFFLINE
> FUNCTION: Central AI monitoring and adjusting carbon levels, reactor efficiency, and city emissions

The AI-Controlled Ecosystem Balance system has crashed. This is the central intelligence that 
coordinates all reactor functions and maintains optimal carbon balance.

To repair this component, locate and enter the correct passphrase.
`,
        passphrase: "balancecarbon", // This would be discovered through a physical puzzle
        successMessage: `
> PROCESSING PASSPHRASE...
> ACCESS GRANTED
> INITIATING SYSTEM REPAIR...
> REBOOTING ARTIFICIAL INTELLIGENCE
> REESTABLISHING MONITORING SYSTEMS
> AI-CONTROLLED ECOSYSTEM BALANCE: ONLINE

Component successfully repaired. Central AI restored and resuming optimal control.

> ALL COMPONENTS REPAIRED
> SYSTEM FULLY OPERATIONAL
> CARBON RECYCLING PROCESS RESUMED
> CONGRATULATIONS: MELTDOWN AVERTED

N.R.R.C is now fully functional. Carbon balance restoration in progress.
Thank you for your critical assistance in this emergency situation.
`,
        hints: [
            "The passphrase relates to maintaining equilibrium in carbon levels. Look for scales or balance-related puzzles in the room.",
            "Examine any AI or computer-related components. The concept of 'balancing' or 'equilibrium' is essential.",
            "The passphrase combines 'balance' with 'carbon'."
        ]
    }
]; 