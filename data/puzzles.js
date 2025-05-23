// Export an array of puzzles generated from the CSV
export const puzzles = [
  // P001
    {
    componentName: "Blocking Generator",
    initialMessage: `The reactor's intake system is blocked because it can't identify the main pollutant it's supposed to capture.\nThe sensors are confused. You need to figure out what the reactor needs to capture.\n\nThere is a hidden message for you that can help you identify the 2 word passphrase`,
    passphrase: "carbon footprint",
    successMessage: `You got it! You have identified the invisible mark: the carbon footprint. This is the total amount of greenhouse gases; like carbon dioxide, methane, and nitrous oxide emitted by a person or organization. It's measured in kilograms, and by tracking this, we can see who the biggest contributors are and how our actions impact the planet.\n\nKnow the sensors know what the generator needs to capture`,
        hints: [
      "There is something in the room that help you see things bigger",
      "I see a chemical element",
      "I see something in red, take a closer look."
    ],
    puzzleType: "standard"
  },
  // P002 - Sorting Puzzle
    {
    componentName: "What is the target?",
    initialMessage: `The molecular disassembly chamber is malfunctioning; the lasers can't target the CO2 to decompose if it doesn't know the sources of the CO2. To calibrate the laser system, you must identify the impact different environmental factors have on our environment.`,
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
        { name: "Technology services", revealedCharacters: "DEN", items: ["Water cooling", "Fossil Fuel", "Electronic waste", "Mining extraction"] },
        { name: "Food", revealedCharacters: "COS", items: ["Deforestation", "Methane emission", "Land use", "Biodiversity loss"] },
        { name: "Transportation", revealedCharacters: "TS", items: ["Fossil Fuel"] }
            ],
            items: [
        { id: "item1", name: "Toxic chemicals", category: "Clothing" },
        { id: "item2", name: "Water use", category: "Clothing" },
        { id: "item3", name: "Microplastic pollution", category: "Clothing" },
        { id: "item4", name: "Water cooling", category: "Technology services" },
        { id: "item5", name: "Fossil Fuel", category: "Technology services" },
        { id: "item6", name: "Electronic waste", category: "Technology services" },
        { id: "item7", name: "Mining extraction", category: "Technology services" },
        { id: "item8", name: "Deforestation", category: "Food" },
        { id: "item9", name: "Methane emission", category: "Food" },
        { id: "item10", name: "Land use", category: "Food" },
        { id: "item11", name: "Biodiversity loss", category: "Food" },
        { id: "item12", name: "Fossil Fuel", category: "Transportation" }
      ]
    }
  },
  // P003 - Updated to be the old P004 (Gridtown Energy)
    {
    componentName: "Gridtown Energy",
    initialMessage: `Welcome to Gridtown, where the future runs on clean energy—if it can be predicted right.
The city's weather patterns determine how much solar, wind, and hydro power is generated each day.
But the energy forecast system has crashed, and only you can reboot it.
Study the weather calendar, use your logic, and calculate the total energy to restore balance to the grid!`,
    passphrase: "104",
    successMessage: `Power restored!
Gridtown lights up once more, thanks to your weather-wise calculations. You've shown how clean energy depends not just on technology, but on understanding nature's rhythm. The forecast is clear: a brighter, greener future!`,
        hints: [
      "Look for machines that are on but not working.",
      "Tiny lights and screens are clues!"
    ],
    puzzleType: "standard"
  },
  // P004 - Updated to be the old P008 (Recycling Kingdom)
    {
    componentName: "Recycling Kingdom",
    initialMessage: `Welcome to the Recycling Kingdom, brave sorter!
The Royal Sorting System has broken down, and chaos looms—banana peels mix with plastic bottles, and mirrors lie where compost should be.
Your mission: restore order by placing each item in its rightful bin—Recyclables, Compost, or Trash.
Choose wisely—only the sharp-eyed and eco-wise will prevail!`,
    passphrase: "48 36 29",
    successMessage: `You did it! The Recycling Kingdom rejoices—waste is sorted, nature breathes again, and harmony is restored.
Thanks to your wise choices, trash finds its place and the cycle continues. Reduce. Reuse. Rejoice!`,
        hints: [
      "If you can eat it, it belongs to nature.",
      "Can't be reused, can't rot away, This trash is doomed to ever stay.",
      "From nature born, to soil returned, In compost bins, their rest is earned.",
      "From every bin, pick low and high — Six digits then will meet your eye."
    ],
    puzzleType: "standard"
  },
  // P005
    {
    componentName: "Special Summit",
    initialMessage: `Welcome delegates. Following the summit, your team must identify key national challenges and align with global solutions. Decode the final action phrase to complete your mission!`,
    passphrase: "NET ZERO",
    successMessage: `Congratulations, delegates! You've successfully uncovered the global mission: NET ZERO. Together, you've decoded the path toward a carbon-neutral future. This is not the end — it's the beginning of climate action.`,
        hints: [
      "Each country card must be matched with its corresponding improvement card.",
      "The correct pairings are all mentioned in the Delegates' Discussion Notes.",
      "The correct sequence follows the order in the meeting record.",
      "The final solution reveals two words."
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
      "There is no calculations. Maybe just giving values",
      "The colors represent something.",
      "The numbers go in the place of colors"
    ],
    puzzleType: "standard"
  },
  // P007
    {
    componentName: "Reveal",
    initialMessage: `Welcome to the Greenwashing Challenge!\nToday, you'll explore the world of eco-friendly claims and discover how some products might not be as green as they appear. Your mission is to look closely, think critically, and uncover hidden truths. Keep your eyes open-sometimes what you see on the surface isn't the full story. Ready to reveal what's really behind the labels? Let's get started!`,
    passphrase: "140SYNTHETICLIES",
    successMessage: `Congratulations! You've uncovered the hidden messages behind the 'eco-friendly' claims. Remember, not everything labeled 'green' or 'sustainable' is what it seems. Always look for real evidence, not just clever marketing, when making choices for the planet.`,
        hints: [
      "The product names have clues to a hidden tool",
      "Look Under the table",
      "Underlined words go together."
    ],
    puzzleType: "standard"
  },
  // P008 - AI Overlord
    {
    componentName: "AI Overload",
    initialMessage: `The generator is down and must be rebooted! You need to gain access to the central control server to fix the generator. The engineers have gone, but they left a note with this message -

"<span style="color:blue">Pr</span>aise be t<span style="color:blue">o</span> thought with silicon born,
Swift are the answers, from dusk until <span style="color:blue">m</span>orn.
It listens and learns, a tireless guide,
With questions it thrives, with nothing to hide.
Count not the cost, just marvel and dream,
For <span style="color:blue">p</span>rogress, like rivers, mus<span style="color:blue">t</span> flow in a <span style="color:blue">s</span>tream -
In the end, it all comes down to the cool blue water."

passphrase: _ _ _ _ _ _ _ = _ _ _ _ _ `,
    passphrase: "Prompts = Water",
    successMessage: `Congratulations! You successfully rebooted the generator. Remember, AI is very useful, but it uses a lot of energy which we can't always see. Everytime you ask AI a question, it uses 2 liters of water.`,
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
    passphrase: "choices",
    successMessage: `Congratulations! You have fixed this part of the generator. Remember, our buying choices are critical to the longevity of our planet and solving the climate crisis. Everytime you buy something, think about the process it has been trhough to make it and what will happen to it when you are finished with it.`,
        hints: [
      "Read everything carefully",
      "Look at the ratings",
      "Think about how the generator is built",
      "What are the CHOICES you have made?"
    ],
    puzzleType: "standard"
    }
]; 