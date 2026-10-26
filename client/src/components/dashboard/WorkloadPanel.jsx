import { sumQty } from '../../hooks/useMonitoring';

const divisions = ['Belum Produksi', 'Pemotong', 'Penjahit', 'Setor Jahit', 'Payet', 'Setor Payet', 'Siap Kirim'];

export default function WorkloadPanel({ work, ready, today }) {
  const all = [...work, ...ready];
  const todayDue = work.filter(item => item.due === today);
  return <section className="panel workload-panel">
    <div><h3>Beban Kerja Hari Ini</h3><p>Prioritas produksi berdasarkan tahap aktif.</p></div>
    <strong><b>{sumQty(todayDue)}</b><small>pcs deadline hari ini</small></strong>
    <div className="workload-list">{divisions.map(name => { const rows = all.filter(item => item.division === name); return <span key={name}><b>{name}</b><em>{sumQty(rows)} <small>pcs</small></em></span>; })}</div>
  </section>;
}
