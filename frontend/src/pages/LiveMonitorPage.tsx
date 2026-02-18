import { useEffect, useState } from 'react';
import { apiBase, authHeaders } from './constants';

interface Metrics {
  calls: number;
  campaigns: number;
  messages: number;
  spend: number;
}

export function LiveMonitorPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${apiBase}/monitor/live`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data: Metrics) => setMetrics(data));

    fetch(`${apiBase}/realtime/stream`, { headers: authHeaders })
      .then((res) => res.text())
      .then((data) => setEvents(data.split('\n').filter((line) => line.startsWith('event:'))));
  }, []);

  return (
    <main>
      <h1>Живой монитор</h1>
      <p>Показатели обновляются автоматически. Вы видите текущие звонки, кампании и сообщения.</p>
      {metrics ? <p>{`${metrics.calls} ${metrics.campaigns} ${metrics.messages} ${metrics.spend}`}</p> : null}
      {events.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </main>
  );
}
