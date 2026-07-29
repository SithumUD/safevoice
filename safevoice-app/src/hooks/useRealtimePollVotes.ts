// src/hooks/useRealtimePollVotes.ts
import { useEffect, useState } from 'react';
import { PollOptionDTO } from '../types/api';
import { stompService } from '../services/stompService';

export interface RealtimePollUpdate {
  pollId: string;
  totalVotes: number;
  options: PollOptionDTO[];
}

export function useRealtimePollVotes(
  pollId?: string,
  initialOptions: PollOptionDTO[] = [],
  initialTotalVotes = 0
) {
  const [options, setOptions] = useState<PollOptionDTO[]>(initialOptions);
  const [totalVotes, setTotalVotes] = useState<number>(initialTotalVotes);

  useEffect(() => {
    setOptions(initialOptions);
    setTotalVotes(initialTotalVotes);
  }, [initialOptions, initialTotalVotes]);

  useEffect(() => {
    if (!pollId) return;

    stompService.connect().then(() => {
      const sub = stompService.subscribe(
        `/topic/polls/${pollId}`,
        (message) => {
          try {
            const body: RealtimePollUpdate = JSON.parse(message.body);
            if (body && body.options) {
              setOptions(body.options);
              setTotalVotes(body.totalVotes);
            }
          } catch {
            // Ignore parse errors
          }
        }
      );

      return () => {
        sub?.unsubscribe();
      };
    });
  }, [pollId]);

  return { options, totalVotes };
}
