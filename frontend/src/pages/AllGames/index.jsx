import { useState } from 'react';
import TabBar from '../../components/TabBar';
import StandingsTable from './StandingsTable';
import Results from './Results';
import Calendar from './Calendar';

const TABS = [
  { id: 'standings', label: 'Таблица' },
  { id: 'results',   label: 'Результаты' },
  { id: 'calendar',  label: 'Календарь' },
];

export default function AllGames() {
  const [tab, setTab] = useState('standings');

  return (
    <div className="tab-content">
      <TabBar tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'standings' && <StandingsTable />}
      {tab === 'results'   && <Results />}
      {tab === 'calendar'  && <Calendar />}
    </div>
  );
}
