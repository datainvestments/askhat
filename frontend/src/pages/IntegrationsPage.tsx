import { useEffect, useState } from 'react';
import { apiBase, authHeaders } from './constants';

interface Integration {
  id: string;
  provider: string;
}

export function IntegrationsPage() {
  const [items, setItems] = useState<Integration[]>([]);

  const connect = async (provider: 'bitrix24' | 'amocrm' | 'google-calendar') => {
    await fetch(`${apiBase}/integrations/${provider}/connect`, { method: 'POST', headers: authHeaders });
    const data = (await (await fetch(`${apiBase}/integrations`, { headers: authHeaders })).json()) as { items: Integration[] };
    setItems(data.items);
  };

  const check = async (id: string) => {
    await fetch(`${apiBase}/integrations/${id}/check`, { method: 'POST', headers: authHeaders });
  };

  useEffect(() => {
    fetch(`${apiBase}/integrations`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data: { items: Integration[] }) => setItems(data.items));
  }, []);

  return (
    <main>
      <h1>Интеграции</h1>
      <p>Подключите CRM и календарь. Агент сможет создавать лиды и назначать встречи.</p>
      <button onClick={() => connect('bitrix24')}>Проверить</button>
      <button onClick={() => connect('amocrm')}>Проверить</button>
      <button onClick={() => connect('google-calendar')}>Проверить</button>
      {items.map((item) => (
        <p key={item.id}>
          <button onClick={() => check(item.id)}>Проверить</button> {item.provider}
        </p>
      ))}
    </main>
  );
}
