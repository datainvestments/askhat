import { NavLink, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { ProjectSelectPage } from './pages/ProjectSelectPage';
import { WizardPage } from './pages/WizardPage';

const menuItems = [
  'Главная',
  'Живой монитор',
  'Звонки',
  'Исходящие обзвоны',
  'Агенты',
  'Номера и подключение',
  'Интеграции',
  'База знаний',
  'Сообщения',
  'CRM',
  'Отчёты',
  'Стоимость и лимиты',
  'Настройки'
] as const;

export function App() {
  return (
    <div className="layout">
      <aside>
        <ul>
          {menuItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <nav>
          <NavLink to="/">Главная</NavLink>
          <NavLink to="/projects">Живой монитор</NavLink>
          <NavLink to="/wizard">Исходящие обзвоны</NavLink>
        </nav>
      </aside>
      <section>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/projects" element={<ProjectSelectPage />} />
          <Route path="/wizard" element={<WizardPage />} />
        </Routes>
      </section>
    </div>
  );
}
