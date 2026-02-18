import { useEffect, useState } from 'react';
import { apiBase, authHeaders } from './constants';

interface Template {
  id: string;
  title: string;
}
interface MessageItem {
  id: string;
  channel: string;
  status: string;
}

export function MessagesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);

  const refresh = async () => {
    const t = (await (await fetch(`${apiBase}/templates`, { headers: authHeaders })).json()) as { items: Template[] };
    const m = (await (await fetch(`${apiBase}/messages`, { headers: authHeaders })).json()) as { items: MessageItem[] };
    setTemplates(t.items);
    setMessages(m.items);
  };

  const connectAndCheck = async (type: 'sms' | 'whatsapp' | 'telegram' | 'email') => {
    await fetch(`${apiBase}/channels/${type}/connect`, { method: 'POST', headers: authHeaders });
    await fetch(`${apiBase}/channels/${type}/check`, { method: 'POST', headers: authHeaders });
  };

  const createTemplate = async () => {
    await fetch(`${apiBase}/templates`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ title: 'Сообщения', body: 'Сообщения' })
    });
    await refresh();
  };

  const testSend = async (id: string) => {
    await fetch(`${apiBase}/templates/${id}/test-send`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ channel: 'sms' })
    });
    await refresh();
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <main>
      <h1>Сообщения</h1>
      <p>Подключение каналов, шаблоны и журнал отправок.</p>
      <button onClick={() => connectAndCheck('sms')}>Проверить</button>
      <button onClick={() => connectAndCheck('whatsapp')}>Проверить</button>
      <button onClick={() => connectAndCheck('telegram')}>Проверить</button>
      <button onClick={() => connectAndCheck('email')}>Проверить</button>
      <button onClick={createTemplate}>Сохранить и продолжить позже</button>
      {templates.map((template) => (
        <p key={template.id}>
          <button onClick={() => testSend(template.id)}>Отправить тестовое сообщение</button> {template.title}
        </p>
      ))}
      {messages.map((message) => (
        <p key={message.id}>{`${message.channel} ${message.status}`}</p>
      ))}
    </main>
  );
}
