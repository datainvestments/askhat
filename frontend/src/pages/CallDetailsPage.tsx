import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiBase, authHeaders } from './constants';

interface CallDetails {
  id: string;
  outcome: string | null;
  transcript: Array<{ role: string; text: string }>;
  tool_invocations: Array<{ tool: string; status: string; result: string }>;
  issues: Array<{ id: string; text: string }>;
  total_cost: number;
  handoff_context: { summary: string; last_user_phrase: string; recommended_action: string } | null;
}

export function CallDetailsPage() {
  const { id } = useParams();
  const [item, setItem] = useState<CallDetails | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`${apiBase}/calls/${id}`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data: { item: CallDetails }) => setItem(data.item));
  }, [id]);

  if (!item) {
    return null;
  }

  return (
    <main>
      <h1>Звонки</h1>
      <p>Записи, транскрипты, результаты и стоимость по каждому звонку.</p>
      <p>{item.outcome ?? ''}</p>
      {item.transcript.map((line, index) => (
        <p key={`${line.role}-${index}`}>{line.text}</p>
      ))}
      {item.tool_invocations.map((tool) => (
        <p key={tool.tool}>{tool.result}</p>
      ))}
      {item.issues.map((issue) => (
        <p key={issue.id}>{issue.text}</p>
      ))}
      <p>{item.total_cost}</p>
      {item.handoff_context ? (
        <>
          <p>{item.handoff_context.summary}</p>
          <p>{item.handoff_context.last_user_phrase}</p>
          <p>{item.handoff_context.recommended_action}</p>
        </>
      ) : null}
    </main>
  );
}
