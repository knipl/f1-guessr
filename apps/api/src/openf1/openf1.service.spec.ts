import { mapMeetings } from './openf1.service';

describe('mapMeetings', () => {
  it('maps race + qualifying per meeting', () => {
    const sessions = [
      {
        session_key: 1,
        meeting_key: 10,
        session_name: 'Race',
        session_type: 'Race',
        date_start: '2026-03-08T15:00:00Z',
        year: 2026
      },
      {
        session_key: 2,
        meeting_key: 10,
        session_name: 'Qualifying',
        session_type: 'Qualifying',
        date_start: '2026-03-07T13:00:00Z',
        year: 2026
      }
    ];

    const meetings = mapMeetings(sessions as any);

    expect(meetings).toHaveLength(1);
    expect(meetings[0].meetingKey).toBe(10);
    expect(meetings[0].race.session_key).toBe(1);
    expect(meetings[0].qualifying?.session_key).toBe(2);
  });

  it('filters meetings without race session', () => {
    const sessions = [
      {
        session_key: 3,
        meeting_key: 11,
        session_name: 'Qualifying',
        session_type: 'Qualifying',
        date_start: '2026-03-07T13:00:00Z',
        year: 2026
      }
    ];

    const meetings = mapMeetings(sessions as any);
    expect(meetings).toHaveLength(0);
  });
});
