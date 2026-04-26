import { useState } from 'react';
import TabBar from '../../components/TabBar';
import TopScorers from './TopScorers';
import Gallery from './Gallery';

const TABS = [
  { id: 'scorers', label: 'Бомбардиры' },
  { id: 'gallery', label: 'Мама я в телике' },
];

export default function MyTeam() {
  const [tab, setTab] = useState('scorers');

  return (
    <div className="tab-content">
      <TabBar tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'scorers' && <TopScorers />}
      {tab === 'gallery' && <Gallery />}
    </div>
  );
}
