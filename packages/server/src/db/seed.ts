import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema.js'
import { decks, flashCards, deckVotes } from './schema.js'

const client = postgres(process.env.DATABASE_URL!)
const db     = drizzle(client, { schema })

const topics = [
  { title: 'Basic Spanish Vocabulary',       description: 'Common Spanish words for beginners.',          hashtags: ['#spanish', '#vocabulary', '#beginner'] },
  { title: 'Japanese Hiragana',              description: 'All 46 base hiragana characters.',              hashtags: ['#japanese', '#hiragana', '#writing'] },
  { title: 'World Capitals',                 description: 'Test your knowledge of world capitals.',        hashtags: ['#geography', '#capitals', '#world'] },
  { title: 'Human Anatomy Basics',           description: 'Key organs and body systems.',                  hashtags: ['#anatomy', '#biology', '#medicine'] },
  { title: 'Python Built-in Functions',      description: 'Essential Python built-ins with examples.',     hashtags: ['#python', '#programming', '#builtin'] },
  { title: 'French Verb Conjugations',       description: 'Present tense conjugations for common verbs.',  hashtags: ['#french', '#verbs', '#grammar'] },
  { title: 'Chemical Elements 1–20',         description: 'First 20 elements of the periodic table.',      hashtags: ['#chemistry', '#elements', '#science'] },
  { title: 'US Presidents Order',            description: 'US presidents in chronological order.',         hashtags: ['#history', '#usa', '#presidents'] },
  { title: 'SQL Fundamentals',               description: 'Core SQL commands and their use cases.',        hashtags: ['#sql', '#database', '#programming'] },
  { title: 'Ancient Rome Facts',             description: 'Key dates, figures, and events of Ancient Rome.', hashtags: ['#history', '#rome', '#ancient'] },
  { title: 'Music Theory Basics',            description: 'Notes, scales, and chords for beginners.',      hashtags: ['#music', '#theory', '#basics'] },
  { title: 'German Articles',                description: 'Der, die, das — mastering German articles.',    hashtags: ['#german', '#grammar', '#articles'] },
  { title: 'TypeScript Types Cheatsheet',    description: 'Common TypeScript type patterns and utilities.', hashtags: ['#typescript', '#programming', '#types'] },
  { title: 'Astronomical Objects',           description: 'Stars, galaxies, nebulae and more.',            hashtags: ['#astronomy', '#space', '#science'] },
  { title: 'Mandarin Chinese Numbers',       description: 'Numbers 1–100 in Mandarin.',                   hashtags: ['#mandarin', '#chinese', '#numbers'] },
  { title: 'Famous Paintings & Artists',     description: 'Match iconic paintings to their creators.',     hashtags: ['#art', '#painters', '#history'] },
  { title: 'Node.js Core Modules',           description: 'Built-in Node.js modules and their purposes.', hashtags: ['#nodejs', '#javascript', '#programming'] },
  { title: 'Greek Mythology Gods',           description: 'Olympian gods and their domains.',              hashtags: ['#mythology', '#greek', '#gods'] },
  { title: 'Nutrition & Macronutrients',     description: 'Proteins, carbs, fats and their roles.',       hashtags: ['#nutrition', '#health', '#biology'] },
  { title: 'European Countries & Capitals',  description: 'All 44 European countries and their capitals.', hashtags: ['#europe', '#geography', '#capitals'] },
  { title: 'Algebra Fundamentals',           description: 'Linear equations, inequalities, and functions.', hashtags: ['#math', '#algebra', '#equations'] },
  { title: 'Korean Hangul Consonants',       description: 'The 14 basic Korean consonants.',               hashtags: ['#korean', '#hangul', '#writing'] },
  { title: 'Docker CLI Commands',            description: 'Essential Docker commands for daily use.',      hashtags: ['#docker', '#devops', '#containers'] },
  { title: 'Literary Devices',              description: 'Metaphor, simile, alliteration and more.',      hashtags: ['#literature', '#english', '#writing'] },
  { title: 'World War II Key Events',        description: 'Major battles and turning points of WWII.',     hashtags: ['#history', '#worldwar2', '#events'] },
  { title: 'Italian Food Vocabulary',        description: 'Common Italian culinary terms.',               hashtags: ['#italian', '#food', '#vocabulary'] },
  { title: 'React Hooks Reference',          description: 'useState, useEffect, useRef and beyond.',       hashtags: ['#react', '#hooks', '#javascript'] },
  { title: 'Physics: Laws of Motion',        description: "Newton's three laws explained.",                hashtags: ['#physics', '#newton', '#science'] },
  { title: 'Shakespeare Plays',              description: 'Identify plays by famous quotes.',              hashtags: ['#shakespeare', '#english', '#literature'] },
  { title: 'Bird Identification',            description: 'Common North American birds by appearance.',    hashtags: ['#birds', '#nature', '#biology'] },
  { title: 'Latin Legal Terms',              description: 'Essential Latin phrases used in law.',          hashtags: ['#latin', '#law', '#legal'] },
  { title: 'Portuguese Greetings',           description: 'Everyday greetings and phrases in Portuguese.', hashtags: ['#portuguese', '#greetings', '#vocabulary'] },
  { title: 'CSS Grid & Flexbox',             description: 'Layout properties and their values.',           hashtags: ['#css', '#webdev', '#layout'] },
  { title: 'Famous Scientists',              description: 'Scientists and their key contributions.',       hashtags: ['#science', '#history', '#scientists'] },
  { title: 'Math: Trigonometry',             description: 'Sine, cosine, tangent and their identities.',  hashtags: ['#math', '#trigonometry', '#calculus'] },
  { title: 'Culinary Techniques',            description: 'Sauté, braise, julienne and more.',            hashtags: ['#cooking', '#techniques', '#culinary'] },
  { title: 'Russian Cyrillic Alphabet',      description: 'All 33 letters of the Russian alphabet.',      hashtags: ['#russian', '#cyrillic', '#alphabet'] },
  { title: 'Economics Terms',               description: 'Core concepts in micro and macroeconomics.',    hashtags: ['#economics', '#finance', '#terms'] },
  { title: 'Git Commands Cheatsheet',        description: 'Everyday Git operations and flags.',            hashtags: ['#git', '#programming', '#devops'] },
  { title: 'Constellations',                description: '88 IAU constellations and their mythology.',    hashtags: ['#astronomy', '#stars', '#constellations'] },
  { title: 'Medical Abbreviations',          description: 'Common abbreviations used in clinical settings.', hashtags: ['#medicine', '#abbreviations', '#clinical'] },
  { title: 'World Religions Overview',       description: 'Core beliefs and practices of major religions.', hashtags: ['#religion', '#culture', '#world'] },
  { title: 'English Irregular Verbs',        description: 'Base, past simple, and past participle forms.', hashtags: ['#english', '#verbs', '#grammar'] },
  { title: 'Cognitive Biases',              description: 'Common mental shortcuts and their effects.',    hashtags: ['#psychology', '#biases', '#cognition'] },
  { title: 'Flags of Asia',                 description: 'Identify Asian countries by their flag.',       hashtags: ['#asia', '#flags', '#geography'] },
  { title: 'Blockchain Concepts',           description: 'Hashing, consensus, smart contracts and more.', hashtags: ['#blockchain', '#crypto', '#technology'] },
  { title: 'Basic Chess Openings',          description: 'Common openings and their key ideas.',          hashtags: ['#chess', '#openings', '#strategy'] },
  { title: 'Human Psychology Terms',        description: 'Freud, Jung, and core psychological concepts.', hashtags: ['#psychology', '#terms', '#mental'] },
  { title: 'Arabic Numbers & Phrases',      description: 'Numbers, greetings, and basic phrases in Arabic.', hashtags: ['#arabic', '#numbers', '#vocabulary'] },
  { title: 'US Constitutional Amendments',  description: 'All 27 amendments and what they protect.',      hashtags: ['#usa', '#law', '#constitution'] },
]

const cardTemplates: Record<string, Array<{ front: string; back: string }>> = {
  default: [
    { front: 'What is the capital of France?',            back: 'Paris' },
    { front: 'What does "ephemeral" mean?',               back: 'Lasting for a very short time' },
    { front: 'What is 12 × 13?',                          back: '156' },
    { front: 'Who wrote "1984"?',                         back: 'George Orwell' },
    { front: 'What is H₂O?',                              back: 'Water — two hydrogen atoms and one oxygen atom' },
    { front: 'What year did WWII end?',                   back: '1945' },
    { front: 'What is the powerhouse of the cell?',       back: 'The mitochondria' },
    { front: 'What language does React use?',             back: 'JavaScript (and TypeScript)' },
  ],
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function seed() {
  console.log('Seeding 50 dummy decks…')

  for (const topic of topics) {
    const [deck] = await db
      .insert(decks)
      .values({
        title:          topic.title,
        description:    topic.description,
        isPublic:       true,
        requiresAnswer: false,
        hashtags:       topic.hashtags,
        authorId:       null,
      })
      .returning()

    const cards = cardTemplates.default.map((c, i) => ({
      deckId:          deck.id,
      front:           c.front,
      back:            c.back,
      acceptedAnswers: [] as string[],
      position:        i,
    }))

    await db.insert(flashCards).values(cards)

    // Assign random likes and dislikes from fake voter IPs
    const likeCount    = randInt(0, 30)
    const dislikeCount = randInt(0, 10)
    const totalVoters  = likeCount + dislikeCount

    if (totalVoters > 0) {
      const votes = Array.from({ length: totalVoters }, (_, i) => ({
        deckId:   deck.id,
        voterIp:  `seed-voter-${i + 1}`,
        vote:     (i < likeCount ? 'like' : 'dislike') as 'like' | 'dislike',
      }))
      await db.insert(deckVotes).values(votes)
    }

    console.log(`  ✓ "${topic.title}" (+${likeCount} / -${dislikeCount})`)
  }

  console.log('Done.')
  await client.end()
}

seed().catch((e) => { console.error(e); process.exit(1) })
