import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function FormularioContacto({ estaAbierto, onCerrar }) {
  const [formData, setFormData] = useState({ nombre: '', email: '', mensaje: '' });
  const [estadoEnvio, setEstadoEnvio] = useState({ cargando: false, respuesta: '', error: false });

  if (!estaAbierto) return null;

  const manejarCambio = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setEstadoEnvio({ cargando: true, respuesta: '', error: false });

    try {
      const res = await fetch(`${API_URL}/api/contacto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al enviar el mensaje');

      setEstadoEnvio({ cargando: false, respuesta: data.mensaje, error: false });
      setFormData({ nombre: '', email: '', mensaje: '' });
    } catch (err) {
      setEstadoEnvio({ cargando: false, respuesta: err.message, error: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-[#090f20] border border-amber-500/40 rounded-2xl p-7 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
        <button
          onClick={onCerrar}
          aria-label="Cerrar ventana"
          className="absolute top-4 right-4 text-blue-300 hover:text-amber-400 bg-blue-950/60 hover:bg-blue-900 w-8 h-8 rounded-full flex items-center justify-center font-bold transition"
        >
          ✕
        </button>

        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Conexión Directa</span>
          <h2 className="text-2xl font-extrabold text-white mt-1">Enviar Mensaje</h2>
          <p className="text-xs text-blue-200/70 mt-1">
            Los datos se transmitirán en tiempo real a nuestro servidor Express.
          </p>
        </div>

        <form onSubmit={manejarEnvio} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-blue-200 mb-1.5">
              Nombre Completo
            </label>
            <input
              type="text"
              name="nombre"
              placeholder="Ej. Carlos Mendoza"
              value={formData.nombre}
              onChange={manejarCambio}
              required
              className="w-full p-3 rounded-lg bg-[#050811] text-white border border-blue-900/70 focus:border-amber-400 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-blue-200 mb-1.5">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={manejarCambio}
              required
              className="w-full p-3 rounded-lg bg-[#050811] text-white border border-blue-900/70 focus:border-amber-400 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-blue-200 mb-1.5">
              Mensaje o Consulta
            </label>
            <textarea
              name="mensaje"
              rows="3"
              placeholder="Escribe tu mensaje aquí..."
              value={formData.mensaje}
              onChange={manejarCambio}
              required
              className="w-full p-3 rounded-lg bg-[#050811] text-white border border-blue-900/70 focus:border-amber-400 focus:outline-none text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={estadoEnvio.cargando}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold py-3 rounded-lg shadow-lg transition disabled:opacity-50"
          >
            {estadoEnvio.cargando ? 'Transmitiendo...' : 'Enviar al Servidor'}
          </button>

          {estadoEnvio.respuesta && (
            <div className={`text-center text-xs font-medium p-3 rounded-lg border ${estadoEnvio.error ? 'bg-red-950/60 border-red-500/40 text-red-300' : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'}`}>
              {estadoEnvio.respuesta}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
