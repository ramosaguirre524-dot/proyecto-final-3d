import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function AdminSecretModal({ abierto, onCerrar }) {
  const [codigo, setCodigo] = useState('');
  const [datosAdmin, setDatosAdmin] = useState(null);
  const [error, setError] = useState(false);
  const [cargando, setCargando] = useState(false);

  if (!abierto) return null;

  const verificarCodigo = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(false);

    try {
      const res = await fetch(`${API_URL}/api/verificar-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo })
      });

      if (!res.ok) throw new Error('No autorizado');

      const data = await res.json();
      setDatosAdmin(data.datos);
    } catch {
      setError(true);
    } finally {
      setCargando(false);
    }
  };

  const cerrarYReiniciar = () => {
    setCodigo('');
    setDatosAdmin(null);
    setError(false);
    onCerrar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-[#080d1c] border border-amber-500/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(251,191,36,0.2)] text-center">
        <button
          onClick={cerrarYReiniciar}
          className="absolute top-4 right-4 text-blue-200 hover:text-amber-400 bg-blue-950 w-8 h-8 rounded-full font-bold"
        >
          ✕
        </button>

        {!datosAdmin ? (
          <form onSubmit={verificarCodigo} className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Acceso Restringido</span>
            <h3 className="text-xl font-extrabold text-white">Código de Autorización</h3>
            <input
              type="password"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ingresa el código..."
              required
              className="w-full p-3 rounded-lg bg-[#04060d] text-center text-amber-400 font-mono tracking-widest border border-blue-900 focus:border-amber-400 focus:outline-none"
            />
            {error && <p className="text-xs text-red-400">Código incorrecto o servidor desconectado.</p>}
            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {cargando ? 'Verificando...' : 'Verificar'}
            </button>
          </form>
        ) : (
          <div className="space-y-4 py-2">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-400">Ficha de Creador</span>
            <img
              src={`${API_URL}${datosAdmin.gif}`}
              alt="Avatar Creador"
              className="w-36 h-36 object-cover mx-auto rounded-2xl border-2 border-amber-400 shadow-lg"
            />
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-amber-400">
                {datosAdmin.nombre}
              </h3>
              <p className="text-sm font-semibold text-white">
                {datosAdmin.carrera}
              </p>
              <p className="text-xs text-sky-300 font-mono">
                {datosAdmin.correo}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
