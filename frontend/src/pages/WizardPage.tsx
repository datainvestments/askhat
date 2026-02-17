import { WizardStepper } from '../components/WizardStepper';

export function WizardPage() {
  return (
    <main>
      <h1>Исходящие обзвоны</h1>
      <p>Создавайте кампании обзвона по списку, задавайте расписание и лимиты.</p>
      <WizardStepper />
      <button type="button">Проверить</button>
      <button type="button">Сделать тест-звонок</button>
      <button type="button">Отправить тестовое сообщение</button>
      <button type="button">Показать технические детали</button>
      <button type="button">Сохранить и продолжить позже</button>
      <button type="button">Запустить</button>
    </main>
  );
}
