
const fs = require('fs');
const path = require('path');

const seedDir = '/Users/tienlv/projects/learning/english/backend/prisma/seed/';
const files = fs.readdirSync(seedDir).filter(f => f.endsWith('.json') && f !== 'oxford_3000_batch6.json');

const existingWords = new Set();

files.forEach(file => {
  const content = JSON.parse(fs.readFileSync(path.join(seedDir, file), 'utf8'));
  
  const extractWords = (data) => {
    if (Array.isArray(data)) {
      data.forEach(item => {
        if (item.word) existingWords.add(item.word.toLowerCase());
        if (item.words) extractWords(item.words);
      });
    } else if (data.words) {
      data.words.forEach(w => existingWords.add(w.word.toLowerCase()));
    }
  };
  
  extractWords(content);
});

console.log(`Found ${existingWords.size} existing words.`);

const topics = {
  'Science & Research': 'Paradigm, Axiom, Correlation, Causation, Validity, Reliability, Peer-review, Citation, Abstract, Methodology, Empirical, Quantitative, Qualitative, Variable, Constant, Specimen, Falsification, Skepticism, Inference, Synthesis, Catalyst, Enzyme, Genome, Molecule, Particle, Quantum, Relativity, Spectrum, Velocity, Acceleration, Force, Gravity, Energy, Matter, Solution, Reaction, Experiment, Theory, Principle, Discovery, Invention, Innovation, Laboratory, Observation, Analysis, Procedure, Protocol, Instrument, Data, Evidence',
  'Economy & Finance': 'Inflation, Recession, Depression, Expansion, Growth, Market, Capital, Asset, Liability, Revenue, Profit, Loss, Deficit, Surplus, Budget, Fiscal, Monetary, Interest, Dividend, Stock, Bond, Investment, Portfolio, Risk, Return, Equity, Liquidity, Solvency, Bankruptcy, Audit, Tax, Tariff, Trade, Export, Import, Globalization, Commodity, Currency, Exchange, Mortgage, Credit, Debt, Loan, Insurance, Pension, Wage, Salary, Labor, Employment, Unemployment',
  'Art & Literature': 'Masterpiece, Classic, Contemporary, Modernism, Renaissance, Baroque, Impressionism, Surrealism, Abstract, Realism, Portrait, Landscape, Sculpture, Architecture, Canvas, Palette, Stroke, Composition, Perspective, Narrative, Fiction, Non-fiction, Prose, Poetry, Drama, Genre, Plot, Character, Theme, Setting, Metaphor, Simile, Allegory, Irony, Satire, Critique, Review, Gallery, Museum, Exhibition, Performance, Symphony, Orchestra, Melody, Harmony, Rhythm, Opera, Ballet, Cinema, Director',
  'Critical Thinking & Logic': 'Argument, Premise, Conclusion, Fallacy, Bias, Assumption, Inference, Deduction, Induction, Validity, Soundness, Objective, Subjective, Perspective, Reasoning, Analysis, Synthesis, Evaluation, Interpretation, Ambiguity, Clarity, Precision, Relevance, Depth, Breadth, Logic, Contradiction, Paradox, Consistency, Evidence, Proof, Verification, Falsification, Skepticism, Cognitive, Heuristic, Algorithm, Criteria, Standard, Judgment, Reflection, Abstraction, Categorization, Distinction, Nuance, Viewpoint, Consensus, Disagreement, Rebuttal, Refutation',
  'Politics & Governance': 'Democracy, Republic, Monarchy, Autocracy, Dictatorship, Parliament, Congress, Senate, Legislation, Statute, Constitution, Amendment, Referendum, Election, Ballot, Candidate, Campaign, Party, Coalition, Opposition, Administration, Cabinet, Minister, Ambassador, Diplomat, Policy, Regulation, Reform, Sovereignty, Jurisdiction, Municipal, Regional, National, International, Alliance, Treaty, Convention, Protocol, Sanction, Boycott, Diplomacy, Negotiation, Mediation, Arbitration, Bureaucracy, Civil, Public, Private, Sector, Governance',
  'Environment & Ecology': 'Ecosystem, Habitat, Biodiversity, Conservation, Sustainability, Renewable, Resource, Pollution, Emission, Carbon, Footprint, Climate, Warming, Greenhouse, Ozone, Deforestation, Desertification, Erosion, Waste, Recycling, Compost, Organic, Pesticide, Herbicide, Toxic, Hazardous, Endangered, Extinct, Fauna, Flora, Wildlife, Marine, Terrestrial, Aquatic, Wetland, Forest, Grassland, Tundra, Desert, Atmosphere, Biosphere, Hydrosphere, Lithosphere, Geology, Meteorology, Oceanography, Ecology, Environmentalist, Activist, Restoration',
  'Law & Order': 'Justice, Court, Judge, Jury, Lawyer, Attorney, Prosecutor, Defendant, Witness, Testimony, Evidence, Verdict, Sentence, Appeal, Lawsuit, Litigation, Tort, Contract, Property, Criminal, Civil, Felony, Misdemeanor, Fraud, Theft, Assault, Murder, Robbery, Burglary, Corruption, Bribery, Integrity, Ethics, Conduct, Code, Regulation, Compliance, Enforcement, Police, Sheriff, Deputy, Officer, Patrol, Investigation, Interrogation, Warrant, Arrest, Bail, Prison, Jail',
  'Psychology & Mental States': 'Consciousness, Subconscious, Perception, Cognition, Emotion, Motivation, Personality, Behavior, Conditioning, Memory, Intelligence, Aptitude, Development, Abnormal, Clinical, Therapy, Counseling, Psychiatrist, Psychologist, Stress, Anxiety, Depression, Phobia, Trauma, Addiction, Obsession, Compulsion, Narcissism, Empathy, Sympathy, Intuition, Instinct, Reflex, Habit, Trait, Temper, Mood, Sensation, Attention, Learning, Socialization, Identity, Ego, Superego, Id, Archetype, Collective, Individual, Resilience, Wellbeing',
  'Media & Information': 'Communication, Journalism, Broadcasting, Internet, Digital, Social, Platform, Content, Audience, Consumer, User, Network, Protocol, Data, Metadata, Encryption, Security, Privacy, Anonymity, Censorship, Freedom, Speech, Press, Ethics, Accuracy, Bias, Objective, Subjective, Viral, Trend, Hashtag, Influence, Advertising, Marketing, Public, Relations, Publicity, Propaganda, Narrative, Perspective, Source, Verified, Authentic, Credible, Reliable, Information, Knowledge, Wisdom, Technology, Innovation',
  'History & Heritage': 'Civilization, Culture, Tradition, Custom, Legacy, Monument, Artifact, Archive, Manuscript, Chronicle, Era, Period, Century, Decade, Ancient, Medieval, Modern, Contemporary, Prehistoric, Revolution, War, Battle, Treaty, Alliance, Empire, Kingdom, Dynasty, Colony, Independence, Expansion, Migration, Settlement, Ruins, Excavation, Archaeology, Anthropology, Genealogy, Ancestry, Identity, Nation, State, Border, Frontier, Historical, Perspective, Context, Interpretation, Source, Primary, Secondary'
};

const finalTopics = {};

for (const [topic, wordsStr] of Object.entries(topics)) {
  const words = wordsStr.split(', ').map(w => w.trim());
  const filteredWords = words.filter(w => !existingWords.has(w.toLowerCase()));
  console.log(`${topic}: ${filteredWords.length} new words (out of ${words.length})`);
  finalTopics[topic] = filteredWords;
}
