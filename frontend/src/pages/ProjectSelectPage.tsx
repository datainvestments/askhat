import { Link } from 'react-router-dom';

export function ProjectSelectPage() {
  return (
    <main>
      <h1>Интеграции</h1>
      <p>Подключите CRM и календарь. Агент сможет создавать лиды и назначать встречи.</p>
      <Link to="/wizard">Сохранить и продолжить позже</Link>
    </main>
  );
}
