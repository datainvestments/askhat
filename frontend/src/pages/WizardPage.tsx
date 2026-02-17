import { FormEvent, useMemo, useState } from 'react';

const steps = [
  'Создайте проект, куда будут попадать звонки. Проект — это, например, отдел продаж или поддержка.',
  'Подключите ваш номер телефона. Укажите данные от провайдера и нажмите «Проверить подключение». Затем сделайте тест‑звонок.',
  'Настройте перевод на живого человека. Если агент не сможет помочь или клиент попросит оператора — переведём звонок.',
  'Подключите CRM и календарь. Агент сможет создавать лиды/задачи и назначать встречи.',
  'Подключите каналы сообщений. Агент сможет отправлять подтверждения и напоминания после звонка.',
  'Создайте агента по шаблону и настройте цели. Проверьте мини‑симуляцией.',
  'Добавьте базу знаний и запустите. Сделайте тест‑звонок и включите на реальный номер.'
] as const;

const authHeaders = {
  authorization: 'Bearer user-dev:admin:org-dev',
  'x-org-id': 'org-dev',
  'x-project-id': 'project-dev',
  'content-type': 'application/json'
};

export function WizardPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('');
  const [errorText, setErrorText] = useState('');
  const canSubmit = useMemo(() => value.trim().length > 0, [value]);

  const onSaveDraft = async () => {
    if (!canSubmit) {
      setErrorText('Интеграция не подключена');
      return;
    }

    await fetch('http://localhost:3001/api/wizard/draft', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ step: activeStep, data: { [String(activeStep)]: value } })
    });
    setStatus('Сохранить и продолжить позже');
    setErrorText('');
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) {
      setErrorText('Тест‑звонок не прошёл');
      return;
    }

    await fetch('http://localhost:3001/api/wizard/submit', {
      method: 'POST',
      headers: authHeaders
    });
    setStatus('Запустить');
    setErrorText('');
  };

  return (
    <main>
      <h1>Исходящие обзвоны</h1>
      <p>Создавайте кампании обзвона по списку, задавайте расписание и лимиты.</p>
      <form onSubmit={onSubmit}>
        <ol>
          {steps.map((step, index) => (
            <li key={step}>
              <button type="button" onClick={() => setActiveStep(index + 1)}>{`Шаг ${index + 1}`}</button>
              <p>{step}</p>
            </li>
          ))}
        </ol>
        <label htmlFor="wizard-field">Показать технические детали</label>
        <input id="wizard-field" value={value} onChange={(e) => setValue(e.target.value)} />
        {errorText ? <p>{errorText}</p> : null}
        {status ? <p>{status}</p> : null}
        <button type="button">Проверить</button>
        <button type="button">Сделать тест-звонок</button>
        <button type="button">Отправить тестовое сообщение</button>
        <button type="button">Показать технические детали</button>
        <button type="button" onClick={onSaveDraft}>Сохранить и продолжить позже</button>
        <button type="submit">Запустить</button>
      </form>
    </main>
  );
}
