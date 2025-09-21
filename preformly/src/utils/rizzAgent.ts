import { RizzLine } from '../types';

const openers = [
  "I see you're into {tag}. That's actually the second most interesting thing about you",
  "Your {tag} energy is immaculate. We should discuss this over overpriced coffee",
  "Not to be dramatic but your {tag} vibe just restructured my entire morning routine",
  "I was today years old when I realized {tag} could be a personality trait. Teach me your ways?",
  "Your {tag} aesthetic is giving main character energy and I'm here for the subplot",
];

const followUps = [
  "But seriously, what's your go-to spot for peak performative hours?",
  "Also I have a theory that everyone who's into {tag} has strong opinions about oat milk brands",
  "Quick question: sunrise yoga or sunset journaling? This determines everything",
  "Important: do you judge people who say 'expresso' instead of 'espresso'?",
  "Real talk though, how many plants have you kept alive this year?",
  "Scale of 1-10 how much do you judge people who don't bring reusable bags?",
  "Be honest, how many unread New Yorker articles are in your reading list?",
  "Critical intel needed: thoughts on Menschen who wear Allbirds unironically?",
];

export function generateRizzLines(name: string, tag: string): RizzLine {
  const randomOpener = openers[Math.floor(Math.random() * openers.length)];
  const opener = randomOpener.replace('{tag}', tag);

  const shuffledFollowUps = [...followUps].sort(() => Math.random() - 0.5);
  const selectedFollowUps = shuffledFollowUps
    .slice(0, 2)
    .map(f => f.replace('{tag}', tag));

  return {
    opener: `Hey ${name}, ${opener}`,
    followUps: selectedFollowUps,
  };
}