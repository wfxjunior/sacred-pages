// Sound hook for Word Guess — prepared but intentionally disabled.
//
// The completion and feedback moments call this with a semantic event; today it
// does nothing. When sound ships, implement here (respecting a user setting)
// so no component needs to change.

export type WordGuessSoundEvent = "correct" | "incorrect" | "letter_revealed" | "completed";

export function playWordGuessSound(_event: WordGuessSoundEvent): void {
  // Deliberately silent. See module comment.
}
