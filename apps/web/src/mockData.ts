export const mockGroups = [
  { id: 'g1', name: 'Friends League' }
];

export const mockNextRace = {
  name: 'Bahrain Grand Prix',
  circuit: 'Bahrain International Circuit',
  q1StartTime: '2026-03-07T13:00:00Z',
  raceStartTime: '2026-03-08T15:00:00Z'
};

export const mockDrivers = [
  { name: 'Verstappen', team: 'Red Bull' },
  { name: 'Leclerc', team: 'Ferrari' },
  { name: 'Hamilton', team: 'Mercedes' },
  { name: 'Norris', team: 'McLaren' },
  { name: 'Russell', team: 'Mercedes' },
  { name: 'Sainz', team: 'Ferrari' },
  { name: 'Piastri', team: 'McLaren' },
  { name: 'Alonso', team: 'Aston Martin' },
  { name: 'Perez', team: 'Red Bull' },
  { name: 'Albon', team: 'Williams' },
  { name: 'Gasly', team: 'Alpine' },
  { name: 'Ocon', team: 'Alpine' },
  { name: 'Stroll', team: 'Aston Martin' },
  { name: 'Bottas', team: 'Sauber' },
  { name: 'Hulkenberg', team: 'Haas' },
  { name: 'Hadjar', team: 'RB' },
  { name: 'Bortoleto', team: 'Sauber' },
  { name: 'Lawson', team: 'RB' },
  { name: 'Lindblad', team: 'RB' },
  { name: 'Bearman', team: 'Haas' },
  { name: 'Antonelli', team: 'Mercedes' }
];

export const mockVotesTable = [
  {
    user: 'Alex',
    picks: ['Verstappen', 'Leclerc', 'Norris', 'Hamilton', 'Sainz', 'Russell', 'Piastri', 'Alonso', 'Perez', 'Albon'],
    score: 61
  },
  {
    user: 'Maya',
    picks: ['Leclerc', 'Verstappen', 'Hamilton', 'Norris', 'Russell', 'Sainz', 'Alonso', 'Piastri', 'Albon', 'Perez'],
    score: 43
  },
  {
    user: 'Jonas',
    picks: ['Verstappen', 'Norris', 'Leclerc', 'Hamilton', 'Piastri', 'Sainz', 'Russell', 'Perez', 'Alonso', 'Albon'],
    score: 50
  }
];

export const mockStandings = [
  { user: 'Alex', points: 212, gap: 0, change: '+1' },
  { user: 'Jonas', points: 205, gap: 7, change: '-1' },
  { user: 'Maya', points: 190, gap: 22, change: '+0' }
];

export const mockAchievements = [
  { title: 'Champion’s Pick', detail: 'Guessed P1 correctly (Bahrain)' },
  { title: 'Podium Prophet', detail: 'Top 3 nailed (Saudi Arabia)' },
  { title: 'Hot Streak', detail: 'Top 3 overall for 3 races' }
];

export const mockRaceHistory = [
  { race: 'Bahrain GP', score: 61, position: 1 },
  { race: 'Saudi Arabian GP', score: 52, position: 2 },
  { race: 'Australian GP', score: 40, position: 3 }
];
