import { formatDate } from './dates';

const columns = [
  ['No', item => item.rowNumber || ''], ['Channel', item => item.channel], ['Tanggal Pesan', item => formatDate(item.date)],
  ['No. Pesanan / Resi', item => item.id || item.number || ''], ['Username', item => item.username || ''], ['Model', item => item.model || ''],
  ['Warna', item => item.warna || ''], ['Size', item => item.size || ''], ['QTY', item => item.qty], ['Jatuh Tempo', item => formatDate(item.due)],
  ['Tahap Terakhir', item => item.stage || ''], ['Status Resi', item => item.shipped ? 'Sudah Dikirim' : item.finished ? 'Siap Kirim' : 'Belum Dikirim'],
  ['Jenis Pesanan', item => item.express ? 'Express' : 'Reguler']
];

const quote = value => `"${String(value ?? '').replaceAll('"', '""')}"`;

export function exportOrdersCsv(items, fileName = 'floo-monitoring') {
  const csv = [columns.map(([label]) => quote(label)).join(','), ...items.map(item => columns.map(([, get]) => quote(get(item))).join(','))].join('\r\n');
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = `${fileName}.csv`; link.click();
  URL.revokeObjectURL(url);
}
