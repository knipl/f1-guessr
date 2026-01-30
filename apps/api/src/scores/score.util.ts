const pointsByPosition = new Map([
  [1, 25],
  [2, 18],
  [3, 15],
  [4, 12],
  [5, 10],
  [6, 8],
  [7, 6],
  [8, 4],
  [9, 2],
  [10, 1]
]);

export function computeScore(voteRanking: string[], resultPositions: string[]): number {
  return resultPositions.slice(0, 10).reduce((sum, driver, index) => {
    const position = index + 1;
    if (voteRanking[position - 1] === driver) {
      return sum + (pointsByPosition.get(position) ?? 0);
    }
    return sum;
  }, 0);
}
