import { Link } from 'react-router-dom';

export function LoginPage() {
  return (
    <main>
      <h1>Главная</h1>
      <p>Здесь вы видите, как работает агент сегодня: звонки, расходы и возможные проблемы.</p>
      <Link to="/projects">Запустить</Link>
    </main>
  );
}
