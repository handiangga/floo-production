import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { decideAccessRequest, getAccessRequests } from '../services/authService';

const dateFormat = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta',
});

export default function AccessRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAccessRequests();
      setRequests(data.requests);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  async function decide(request, status) {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      if (status === 'rejected') {
        const answer = await Swal.fire({
          title: 'Tolak permintaan akses?',
          text: request.email,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Tolak',
          cancelButtonText: 'Batal',
        });
        if (!answer.isConfirmed) return;
      }
      await decideAccessRequest(request.id, status);
      setRequests(current => current.filter(row => row.id !== request.id));
      setNotice(status === 'approved'
        ? `Akses untuk ${request.email} disetujui. Pengguna dapat masuk lewat Google.`
        : `Permintaan dari ${request.email} ditolak.`);
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header className="topbar">
        <div className="page-title">
          <h2>Permintaan Akses</h2>
          <p>Tinjau akun Google yang meminta akses ke dashboard FLOO.</p>
        </div>
        <button type="button" className="control" onClick={loadRequests} disabled={loading || saving}>Muat ulang</button>
      </header>
      <section className="panel p-5" aria-busy={loading || saving}>
        {notice && <p role="status" className="text-sm text-green-800 mb-3 break-words">{notice}</p>}
        {error && <p role="alert" className="text-sm text-red-700 mb-3">{error}</p>}
        {loading && <p className="empty-note">Memuat permintaan akses…</p>}
        {!loading && !error && !requests.length && <p className="empty-note">Belum ada permintaan yang menunggu persetujuan.</p>}
        <ul className="divide-y">
          {requests.map(request => (
            <li key={request.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div className="min-w-0 break-words">
                <p className="font-semibold">{request.name || request.email}</p>
                {request.name && <p className="text-sm">{request.email}</p>}
                <p className="text-sm text-gray-500">{dateFormat.format(new Date(request.createdAt))} WIB</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="control" disabled={saving || loading} onClick={() => decide(request, 'rejected')}>Tolak</button>
                <button type="button" className="rounded-lg bg-floo px-4 py-2 text-white" disabled={saving || loading} onClick={() => decide(request, 'approved')}>Setujui</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
