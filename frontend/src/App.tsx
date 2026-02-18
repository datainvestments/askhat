import { NavLink, Route, Routes } from 'react-router-dom';
import { CallDetailsPage } from './pages/CallDetailsPage';
import { CallsPage } from './pages/CallsPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { LiveMonitorPage } from './pages/LiveMonitorPage';
import { LoginPage } from './pages/LoginPage';
import { MessagesPage } from './pages/MessagesPage';
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
          <NavLink to="/monitor">Живой монитор</NavLink>
          <NavLink to="/calls">Звонки</NavLink>
          <NavLink to="/wizard">Исходящие обзвоны</NavLink>
          <NavLink to="/integrations">Интеграции</NavLink>
          <NavLink to="/messages">Сообщения</NavLink>
        </nav>
      </aside>
      <section>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/projects" element={<ProjectSelectPage />} />
          <Route path="/wizard" element={<WizardPage />} />
          <Route path="/monitor" element={<LiveMonitorPage />} />
          <Route path="/calls" element={<CallsPage />} />
          <Route path="/calls/:id" element={<CallDetailsPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
        </Routes>
      </section>
    </div>
  );
}
