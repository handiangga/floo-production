import { CalendarDays, ChevronDown, RefreshCw } from 'lucide-react';
const titles = { Dashboard: ['Dashboard', 'Ringkasan produksi dan pengiriman pesanan dari Shopee, TikTok, dan WhatsApp'], 'Monitoring Pesanan': ['Monitoring Pesanan', 'Telusuri status setiap pesanan produksi'], 'Laporan Deadline': ['Laporan Deadline', 'Prioritaskan pesanan yang membutuhkan tindak lanjut'] };
import { currentMonth } from '../../utils/dates';

function getMonthOptions(selectedMonth) {
  const [year, month] = currentMonth().split('-').map(Number);
  const formatter = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const months = new Set(Array.from({ length: 24 }, (_, index) =>
    new Date(Date.UTC(year, month - 1 - index, 1)).toISOString().slice(0, 7)
  ));
  months.add(selectedMonth);
  return [...months].sort().reverse().map(value => [value, formatter.format(new Date(value + '-01T00:00:00Z'))]);
}

export default function Header({ page, month, setMonth, channel, setChannel, updated, user }) { const monthOptions = getMonthOptions(month);
  const [title, subtitle] = titles[page] || titles.Dashboard; return <header className="topbar no-print"><div className="page-title"><h2>{title}</h2><p>{subtitle}</p></div><div className="header-actions"><label className="control"><CalendarDays size={17} /><input aria-label="Bulan" type="month" value={month} onChange={e => setMonth(e.target.value)} /><ChevronDown size={15} /></label><label className="control"><select value={channel} onChange={e => setChannel(e.target.value)}>{['Semua', 'Shopee', 'TikTok', 'WhatsApp'].map(x => <option key={x} value={x}>{x === 'Semua' ? 'Semua Channel' : x}</option>)}</select><ChevronDown size={15} /></label><div className="sync"><RefreshCw size={18} /><span>Terakhir diperbarui<br /><b>{updated ? new Date(updated).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }) : 'Belum tersinkron'}</b></span></div><div className="profile"><span>{(user?.name || user?.email || 'F').slice(0, 2).toUpperCase()}</span><p>{user?.name || 'FLOO User'}<small>{user?.email}</small></p></div></div></header>; }
