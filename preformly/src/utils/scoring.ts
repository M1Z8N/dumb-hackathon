export function calculatePreformanceScore(baseScore: number, appliedEdits: string[]): number {
  let score = baseScore;

  const editBonuses: Record<string, number> = {
    sunglasses: 8,
    matcha: 12,
    tote: 10,
    vest: 15,
    airpods: 7,
    performative: 20,
  };

  appliedEdits.forEach(edit => {
    const key = edit.toLowerCase().replace(/[^a-z]/g, '');
    Object.keys(editBonuses).forEach(bonus => {
      if (key.includes(bonus)) {
        score += editBonuses[bonus];
      }
    });
  });

  return Math.min(100, score);
}