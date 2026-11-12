import {useEffect,useState} from 'react';import Swal from 'sweetalert2';import {loginGoogle,publicConfig} from '../services/authService';
export default function LoginPage({ onLogin }) {
  const [config, setConfig] = useState(null);
  const [pending, setPending] = useState(false);
  const id = config?.googleClientId;

  useEffect(() => {
    publicConfig().then(setConfig).catch(() => setConfig({}));
  }, []);

  useEffect(() => {
    if (!id) return;
    let active = true;
    const setup = () => {
      if (!active || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: id,
        callback: async ({ credential }) => {
          setPending(false);
          try {
            const data = await loginGoogle(credential);
            if (!active) return;
            if (data.status === 'pending') setPending(true);
            else onLogin(data.user);
          } catch (error) {
            if (active) Swal.fire('Login ditolak', error.message, 'error');
          }
        },
      });
      const button = document.getElementById('google-btn');
      if (button) {
        button.innerHTML = '';
        window.google.accounts.id.renderButton(button, { theme: 'outline', size: 'large', width: 280 });
      }
    };
    if (window.google?.accounts?.id) {
      setup();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = setup;
      document.head.appendChild(script);
    }
    return () => { active = false; };
  }, [id, onLogin]);

  return (
    <main className="min-h-screen grid place-items-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full">
        <h1 className="font-serif text-6xl text-floo">FLOO</h1>
        <p className="tracking-[.3em] text-xs mt-2">PRODUCTION MONITORING</p>
        <h2 className="font-semibold text-2xl mt-10">Selamat Datang</h2>
        <p className="text-sm text-gray-500 my-4">
          {config?.accessRequestsEnabled
            ? 'Masuk dengan Google. Jika akunmu baru, permintaan akses akan dikirim untuk disetujui.'
            : 'Masuk dengan akun Google yang sudah diberikan akses.'}
        </p>
        <div className="flex justify-center" id="google-btn" />
        {pending && <p role="status" className="text-sm text-floo bg-rose-50 rounded-xl p-3 mt-4">
          Permintaan akses menunggu persetujuan. Masuk lagi dengan akun yang sama setelah disetujui.
        </p>}
        {config && !id && <p className="text-red-500 text-sm mt-4">GOOGLE_CLIENT_ID belum dikonfigurasi.</p>}
      </div>
    </main>
  );
}
