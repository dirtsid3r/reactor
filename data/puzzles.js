// Export an array of puzzles generated from the CSV
export const puzzles = [
  // P001
  {
    componentName: "Blocking generator",
    initialMessage: `The reactor's intake system is blocked because it can't identify the main pollutant it's supposed to capture.\nThe sensors are confused. You need to figure out what the reactor needs to capture.\n\nThere is a hidden message for you that can help you`,
    passphrase: "carbon footprint",
    successMessage: `You got it! You have identified the invisible mark: the carbon footprint. This is the total amount of greenhouse gases; like carbon dioxide, methane, and nitrous oxide emitted by a person or organization. It's measured in kilograms, and by tracking this, we can see who the biggest contributors are and how our actions impact the planet.\n\nKnow the sensors know what the generator needs to capture`,
        hints: [
      "There are clues in the letter look carefully",
      "There is something in the room that help is see things bigger",
      "The letter has the answer in it, look at the icons",
      "Is that a human trace?"
    ],
    puzzleType: "standard"
  },
  // P002 - Sorting Puzzle
  {
    componentName: "What is the target?",
    initialMessage: `The molecular disassembly chamber is malfunctioning; the lasers can't target the CO2 to decompose if it doesn't know the sources of the CO2. To calibrate the laser system, you must identify the hidden costs different categories have in our environment.`,
    passphrase: "hidden costs",
    successMessage: `You nailed it! Now the lasers know where to point. \nOur daily actions and choices impact the world. Every sector has hidden costs that we sometimes can not see but we can help reduce with small actions. For example, we can buy food grown locally, buy second-hand clothes, use different types of transportation, like walking or riding a bicycle. \n\nDid you know that one-third of all food produced is wasted?  Every year, wasted food in the UK represents 14 million tonnes of carbon dioxide emissions. In total, these greenhouse gas emissions are the same as those created by 7 million cars each year.`,
        hints: [
      "Clothes: When you wash your clothes there is something that can go into the ocean and affect the animals",
      "Food: The animals that we eat for our diet need a place where to live, what cost it can have?",
      "Transportation: In order to move what source of energy do you need?",
      "Technology: When you want to change your phone and tablet where does it go?"
    ],
        puzzleType: "sorting",
        sortingData: {
      instructions: "Sort the hidden costs into their correct categories to reveal the passphrase.",
            categories: [
        { name: "Clothing", revealedCharacters: "HID", items: ["Toxic chemicals", "Water use", "Microplastic pollution"] },
        { name: "Technology services", revealedCharacters: "DEN", items: ["Water cooling", "Fossil Fuel", "Ecological Waste", "Mining extraction"] },
        { name: "Food", revealedCharacters: "COS", items: ["Deforestation", "Methane emission", "Land use", "Biodiversity loss"] },
        { name: "Transportation", revealedCharacters: "TS", items: ["Fossil Fuel"] }
            ],
            items: [
        { id: "item1", name: "Toxic chemicals", category: "Clothing" },
        { id: "item2", name: "Water use", category: "Clothing" },
        { id: "item3", name: "Microplastic pollution", category: "Clothing" },
        { id: "item4", name: "Water cooling", category: "Technology services" },
        { id: "item5", name: "Fossil Fuel", category: "Technology services" },
        { id: "item6", name: "Ecological Waste", category: "Technology services" },
        { id: "item7", name: "Mining extraction", category: "Technology services" },
        { id: "item8", name: "Deforestation", category: "Food" },
        { id: "item9", name: "Methane emission", category: "Food" },
        { id: "item10", name: "Land use", category: "Food" },
        { id: "item11", name: "Biodiversity loss", category: "Food" },
        { id: "item12", name: "Fossil Fuel", category: "Transportation" }
      ]
    }
  },
  // P003
  {
    componentName: "Power Plant Leak",
    initialMessage: `At the power plant control room, there's an energy leak happening because some machines are still drawing power even though they're not running properly.\nStudents have to spot the machines that are leaking phantom energy and identify the cause.`,
    passphrase: "Idle Monitor Control Panel Lights Security Cameras Charging Station Coffee Machine",
    successMessage: `Great job finding the leaks!\nThis hidden waste of energy is called Phantom Power (or Standby Power).\nEven when machines seem 'off,' they can still quietly drain energy unless fully unplugged or switched off.`,
        hints: [
      "Look for machines that are on but not working.",
      "Tiny lights and screens are clues!"
    ],
    puzzleType: "standard"
  },
  // P004
  {
    componentName: "Recycling Relay",
    initialMessage: `The recycling center's sorting machine is broken!\nYou need to manually sort the trash into the correct bins before the pile overflows.\nMatch each item to the right recycling bin. Act fast — the planet is counting on you!`,
    passphrase: "Plastic Paper Metal Organic E-Waste Glass",
    successMessage: `Great job! The recycling center is back on track!\nRemember, sorting waste correctly reduces pollution, saves energy, and gives new life to old items.\nEvery correctly recycled object keeps our planet cleaner and greener.`,
        hints: [
      "If you can eat it, it belongs to nature.",
      "If it plugs in or uses batteries, it's special waste.",
      "Shiny and metallic? There's a bin for that too.",
      "Clear and fragile? Handle with care."
    ],
    puzzleType: "standard"
  },
  // P005
  {
    componentName: "Keep 1.5 Alive",
    initialMessage: `Welcome delegates. Following the summit, your team must identify key national challenges and align with global solutions. Decode the final action phrase to complete your mission!`,
    passphrase: "KEEP 1.5 ALIVE",
    successMessage: `Congratulations, delegates! You have uncovered the summit's call to action: KEEP 1.5 ALIVE. Your teamwork has shaped a more sustainable future!`,
        hints: [
      "Each country's strengths are visible — but its problems are hidden in plain sight.",
      "Only one problem card truly fits each country's hidden challenge. Don't be fooled by surface similarities.",
      "If the letters don't make sense, your match may be wrong. The correct alignment reveals the true message."
    ],
    puzzleType: "standard"
  },
  // P006
  {
    componentName: "Water Use",
    initialMessage: `From heaven's tears to your daily needs, Some choices drain more than others indeed. To unlock the secrets that I withhold, Arrange nature's thirst from large to small. Enter the order as the passphrase below.`,
    passphrase: "Beef, Burger, Milk, Coffee, Toast, Tea",
    successMessage: `Well done! You've unlocked the water use values - a vital step in understanding how much water goes into everyday items. Remember, water is a precious resource, and excessive use strains our rivers, lakes, and communities. By being mindful of water consumption, we can protect ecosystems and ensure clean water for everyone, now and in the future. Keep making choices that save water and support a sustainable planet!`,
        hints: [
      "It flows from your tap, fills your kettle, and keeps gardens green. What precious resource should we never take for granted?",
      "Not all colors are just pretty-they carry meaning and numbers too. What could each shade be trying to tell you?",
      "Each item card has a color-each color has its own spot on the color wheel, and that spot holds a number. Match the color to its place on the wheel to discover how many litres of water are used!"
    ],
    puzzleType: "standard"
  },
  // P007
  {
    componentName: "UV Reveal",
    initialMessage: `Welcome to the Greenwashing Challenge!\nToday, you'll explore the world of eco-friendly claims and discover how some products might not be as green as they appear. Your mission is to look closely, think critically, and uncover hidden truths. Keep your eyes open-sometimes what you see on the surface isn't the full story. Ready to reveal what's really behind the labels? Let's get started!`,
    passphrase: "140SYNTHETICLIES",
    successMessage: `Congratulations! You've uncovered the hidden messages behind the 'eco-friendly' claims. Remember, not everything labeled 'green' or 'sustainable' is what it seems. Always look for real evidence, not just clever marketing, when making choices for the planet.`,
        hints: [
      "Some claims shine only under closer inspection. Maybe you need a special tool to reveal the truth!",
      "Sometimes the truth is hidden just out of sight-try looking where shadows fall and secrets hide beneath your feet.",
      "Look carefully at the underlined words. Once you have them, enter all the underlined words together as one continuous word-no spaces or punctuation. This will fix the component."
    ],
    puzzleType: "standard"
  },
  // P008
  {
    componentName: "AI Overlord",
    initialMessage: `The generator is down and must be rebooted! You need to gain access to the central control server to fix the generator. The engineers have gone, but they left a note with this message - \n\n"Praise be to thought with silicon born,\nSwift are the answers, from dusk until morn.\nIt listens and learns, a tireless guide,\nWith questions it thrives, with nothing to hide.\nCount not the cost, just marvel and dream,\nFor progress, like rivers, must flow in a stream -\nIn the end, it all comes down to the cool blue water."\n\n[colours are important]`,
    passphrase: "Prompts = Water",
    successMessage: `Congratulations! You successfuly rebooted the generator. Remember, AI is very useful, but it uses a lot of energy which we can't always see. Everytime you ask AI a question, it uses 2 liters of water.`,
        hints: [
      "Look beyond the words",
      "At the end",
      "What a beautiful blue",
      "Sustainance for life"
    ],
    puzzleType: "standard"
  },
  // P009
  {
    componentName: "Generator Chaos",
    initialMessage: `The manager of the generator has caused chaos in an angry meltdown. The machine has a "sustainability flow circuit". You place the components in the correct places in order to resolve the chaos and fix this part of the generator.`,
    passphrase: "Recycled Aluminum Panels Bamboo Insulation Wrap Reclaimed Copper Coil 3D-printed Plastic Mount Modular Circuit Core Solar-Compatible Glass Panel",
    successMessage: `Congratulations! You have fixed this part of the generator. Remember, our buying choices are critical to the longevity of our planet and solving the climate crisis. Everytime you buy something, think about the process it has been trhough to make it and what will happen to it when you are finished with it.`,
        hints: [
      "The system only looks at how the part was made and where it has come from",
      "Imported or mined? Not what we're looking to find.",
      "To comply with the generator surcing standards, parts will need to have a low energy footprint.",
      "Recycled or renewable, minimal energy, reusable and repairable"
    ],
    puzzleType: "standard"
    }
]; 