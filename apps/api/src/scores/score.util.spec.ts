import { computeScore } from './score.util';

describe('computeScore', () => {
  it('awards points for exact matches only', () => {
    const vote = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const result = ['A', 'B', 'X', 'D', 'Y', 'F', 'G', 'Z', 'I', 'J'];

    expect(computeScore(vote, result)).toBe(25 + 18 + 12 + 8 + 6 + 2 + 1);
  });

  it('returns zero when no positions match', () => {
    const vote = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const result = ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];

    expect(computeScore(vote, result)).toBe(0);
  });
});
