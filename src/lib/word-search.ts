export type Placement = { word: string; row: number; col: number; dr: number; dc: number };

export function buildGrid(words: string[], size = 12): { grid: string[][]; placements: Placement[] } {
  const grid: (string | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [-1, 1],
  ];
  const placements: Placement[] = [];
  const rand = mulberry32(42);

  for (const raw of words) {
    const word = raw.toUpperCase();
    let placed = false;
    for (let attempt = 0; attempt < 200 && !placed; attempt++) {
      const [dr, dc] = dirs[Math.floor(rand() * dirs.length)];
      const row = Math.floor(rand() * size);
      const col = Math.floor(rand() * size);
      const endR = row + dr * (word.length - 1);
      const endC = col + dc * (word.length - 1);
      if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;
      let ok = true;
      for (let i = 0; i < word.length; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (grid[r][c] && grid[r][c] !== word[i]) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      for (let i = 0; i < word.length; i++) {
        grid[row + dr * i][col + dc * i] = word[i];
      }
      placements.push({ word, row, col, dr, dc });
      placed = true;
    }
  }

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) grid[r][c] = letters[Math.floor(rand() * letters.length)];
    }
  }
  return { grid: grid as string[][], placements };
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}