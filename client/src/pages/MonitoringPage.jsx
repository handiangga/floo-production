import { useEffect, useMemo, useState } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import OrdersTable from '../components/orders/OrdersTable';
import { exportOrdersCsv } from '../utils/exportOrders';

export default function MonitoringPage({ query, onQuery, items, today, onDetail, presetStatus = 'all', onPresetUsed }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [status, setStatus] = useState('all');
  const [division, setDivision] = useState('all');
  const [dueRange, setDueRange] = useState('all');
  const [dueFrom, setDueFrom] = useState('');
  const [dueTo, setDueTo] = useState('');
  const [expressOnly, setExpressOnly] = useState(false);
  const divisions = useMemo(() => [...new Set(items.map(item => item.division).filter(Boolean))], [items]);
  const filteredItems = useMemo(() => items.filter(item => {
    const days = item.due ? Math.round((Date.parse(`${item.due}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000) : null;
    const statusMatch = status === 'all' || (status === 'unshipped' && !item.shipped) || (status === 'shipped' && item.shipped) || (status === 'ready' && !item.shipped && item.finished) || (status === 'overdue' && !item.shipped && days !== null && days < 0);
    const dueMatch = dueRange === 'all' || (dueRange === 'today' && days === 0) || (dueRange === 'next3' && days !== null && days >= 0 && days <= 3) || (dueRange === 'overdue' && days !== null && days < 0);
    const customDateMatch = (!dueFrom || (item.due && item.due >= dueFrom)) && (!dueTo || (item.due && item.due <= dueTo));
    return statusMatch && dueMatch && customDateMatch && (division === 'all' || item.division === division) && (!expressOnly || item.express);
  }), [items, today, status, division, dueRange, dueFrom, dueTo, expressOnly]);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = filteredItems.slice(start, start + pageSize);

  useEffect(() => setPage(1), [query, pageSize, filteredItems.length]);
  useEffect(() => { if (presetStatus !== 'all') { setStatus(presetStatus); onPresetUsed?.(); } }, [presetStatus, onPresetUsed]);
  const resetFilters = () => { setStatus('all'); setDivision('all'); setDueRange('all'); setDueFrom(''); setDueTo(''); setExpressOnly(false); onQuery(''); };

  return <section className="panel monitoring-page">
    <input placeholder="Cari username, nomor, ID, model, warna..." className="no-print monitor-search" value={query} onChange={e => onQuery(e.target.value)} />
    <div className="advanced-filters no-print">
      <label>Status<select value={status} onChange={e => setStatus(e.target.value)}><option value="all">Semua status</option><option value="unshipped">Belum dikirim</option><option value="ready">Siap kirim</option><option value="shipped">Sudah dikirim</option><option value="overdue">Lewat deadline</option></select></label>
      <label>Divisi<select value={division} onChange={e => setDivision(e.target.value)}><option value="all">Semua divisi</option>{divisions.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
      <label>Deadline<select value={dueRange} onChange={e => setDueRange(e.target.value)}><option value="all">Semua tanggal</option><option value="today">Hari ini</option><option value="next3">H+1 sampai H+3</option><option value="overdue">Sudah lewat</option></select></label>
      <label>Dari deadline<input type="date" value={dueFrom} onChange={e => setDueFrom(e.target.value)} /></label><label>Sampai deadline<input type="date" value={dueTo} onChange={e => setDueTo(e.target.value)} /></label>
      <label className="express-filter"><input type="checkbox" checked={expressOnly} onChange={e => setExpressOnly(e.target.checked)} /> Express 7 hari</label>
      <button onClick={resetFilters}><RotateCcw size={15} /> Reset</button><button className="export-button" onClick={() => exportOrdersCsv(filteredItems, `floo-monitoring-${today}`)}><Download size={15} /> Export CSV</button>
    </div>
    <OrdersTable items={pageItems} today={today} onDetail={onDetail} />
    <footer className="monitor-pagination no-print">
      <span>Menampilkan {filteredItems.length ? start + 1 : 0}–{Math.min(start + pageSize, filteredItems.length)} dari {filteredItems.length} pesanan</span>
      <label>Data per halaman<select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}><option value={50}>50</option><option value={100}>100</option></select></label>
      <div><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>‹ Sebelumnya</button><b>Halaman {currentPage} / {totalPages}</b><button disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Berikutnya ›</button></div>
    </footer>
  </section>;
}
