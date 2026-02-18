import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiBase, authHeaders } from './constants';

interface CallItem {
  id: string;
  outcome: string | null;
}

export function CallsPage() {
  const [items, setItems] = useState<CallItem[]>([]);

  useEffect(() => {
    fetch(`${apiBase}/calls`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data: { items: CallItem[] }) => setItems(data.items));
  }, []);

  return (
    <main>
      <h1>Звонки</h1>
      <p>Записи, транскрипты, результаты и стоимость по каждому звонку.</p>
      {items.map((item) => (
        <p key={item.id}>
          <Link to={`/calls/${item.id}`}>{item.id}</Link> {item.outcome ?? ''}
        </p>
      ))}
    </main>
  );
}
