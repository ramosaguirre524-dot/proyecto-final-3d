import { useState } from 'react';
import Navbar from './components/Navbar';
import Escena3D from './components/Escena3D';
import FormularioContacto from './components/FormularioContacto';
import AdminSecretModal from './components/AdminSecretModal';
import Samba3D from './components/Samba3D';
import { MODELOS_3D } from './data/modelosData';

export default function App() {
  const [modeloSeleccionadoId, setModeloSeleccionadoId] = useState(MODELOS_3D.id);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [adminAbierto, setAdminAbierto] = useState(false);
  const [sambaAbierto, setSambaAbierto] = useState(false);

  const [configAtomo, setConfigAtomo] = useState({
    orbitas: 3,
    electrones: 2,
    velocidad: 1.0
  });

  const modeloActual = MODELOS_3D.find((m) => m.id === modeloSeleccionadoId) || MODELOS_3D;

  const cambiarParametroAtomo = (campo, delta, min, max) => {
    setConfigAtomo((prev) => {
      const nuevoValor = Math.max(min, Math.min(max, prev[campo] + delta));
      return { ...prev, [campo]: nuevoValor };
    });
  };

  return (
    <div className="relative min-h-screen bg-[#04060d] text-white font-sans selection:bg-amber-400 selection:text-slate-950 flex flex-col justify-between">
      <div>
        <Navbar onAbrirContacto={() => setModalAbierto(true)} />

        <main id="galeria" className="container mx-auto px-4 py-8 md:py-10">
          <div className="text-center max-w-2xl mx-auto mb-7 space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
              Exhibición Interactiva WebGL
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">
              Laboratorio de Modelos <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">3D</span>
            </h2>
            <p className="text-blue-200/75 text-sm md:text-base">
              Selecciona una estructura tridimensional para explorar su arquitectura y probar su mecánica de control.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-7">
            {MODELOS_3D.map((modelo) => {
              const activo = modelo.id === modeloSeleccionadoId;
              return (
                <button
                  key={modelo.id}
                  onClick={() => setModeloSeleccionadoId(modelo.id)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                    activo
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.4)] scale-105'
                      : 'bg-[#090f20] text-blue-200 border-blue-900/50 hover:border-amber-500/50 hover:text-white'
                  }`}
                >
                  {modelo.nombre}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-7 flex flex-col gap-4">
              <Escena3D modeloActivo={modeloActual.id} configAtomo={configAtomo} />

              {modeloActual.id === 'atomo' && (
                <div className="bg-[#080d1c] border border-amber-500/30 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="bg-[#050811] p-3 rounded-xl border border-blue-900/50 text-center">
                    <span className="block text-xs text-blue-300 uppercase font-bold mb-2">Órbitas (Máx. 5)</span>
                    <div className="flex items-center justify-center space-x-3">
                      <button onClick={() => cambiarParametroAtomo('orbitas', -1, 1, 5)} disabled={configAtomo.orbitas <= 1} className="w-8 h-8 rounded-lg bg-blue-950 hover:bg-amber-400 hover:text-slate-950 font-bold disabled:opacity-30 transition">-</button>
                      <span className="text-lg font-extrabold text-amber-400 w-6">{configAtomo.orbitas}</span>
                      <button onClick={() => cambiarParametroAtomo('orbitas', 1, 1, 5)} disabled={configAtomo.orbitas >= 5} className="w-8 h-8 rounded-lg bg-blue-950 hover:bg-amber-400 hover:text-slate-950 font-bold disabled:opacity-30 transition">+</button>
                    </div>
                  </div>

                  <div className="bg-[#050811] p-3 rounded-xl border border-blue-900/50 text-center">
                    <span className="block text-xs text-blue-300 uppercase font-bold mb-2">Electrones / Órbita</span>
                    <div className="flex items-center justify-center space-x-3">
                      <button onClick={() => cambiarParametroAtomo('electrones', -1, 1, 4)} disabled={configAtomo.electrones <= 1} className="w-8 h-8 rounded-lg bg-blue-950 hover:bg-amber-400 hover:text-slate-950 font-bold disabled:opacity-30 transition">-</button>
                      <span className="text-lg font-extrabold text-amber-400 w-6">{configAtomo.electrones}</span>
                      <button onClick={() => cambiarParametroAtomo('electrones', 1, 1, 4)} disabled={configAtomo.electrones >= 4} className="w-8 h-8 rounded-lg bg-blue-950 hover:bg-amber-400 hover:text-slate-950 font-bold disabled:opacity-30 transition">+</button>
                    </div>
                  </div>

                  <div className="bg-[#050811] p-3 rounded-xl border border-blue-900/50 text-center">
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-blue-300 uppercase">Velocidad</span>
                      <span className="text-amber-400">{configAtomo.velocidad.toFixed(1)}x</span>
                    </div>
                    <input type="range" min="0.2" max="3.0" step="0.2" value={configAtomo.velocidad} onChange={(e) => setConfigAtomo({ ...configAtomo, velocidad: parseFloat(e.target.value) })} className="w-full accent-amber-400 cursor-pointer" />
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 bg-[#080d1c] border border-blue-900/50 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-xl">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-blue-900/50 pb-4">
                  <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-950 text-sky-300 border border-sky-500/30">
                    {modeloActual.categoria}
                  </span>
                  <span className="w-4 h-4 rounded-full border border-white/40" style={{ backgroundColor: modeloActual.colorHex }} />
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold text-amber-400 mb-2">{modeloActual.nombre}</h3>
                  <p className="text-blue-100/80 text-sm leading-relaxed">{modeloActual.descripcion}</p>
                </div>

                <div className="bg-[#050811] border-l-4 border-amber-400 p-4 rounded-r-xl space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Mecánica Interactiva</h4>
                  <p className="text-blue-200/90 text-sm">{modeloActual.mecanica}</p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-blue-900/40 flex items-center justify-between text-xs text-blue-300/60">
                <span>Motor: Three.js + OrbitControls</span>
                <button onClick={() => setModalAbierto(true)} className="text-amber-400 hover:underline font-semibold">
                  ¿Consultas? Abrir contacto →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="relative py-6 px-4 text-center border-t border-blue-950/40 mt-8">
        <span
          onClick={() => setAdminAbierto(true)}
          className="text-xs text-blue-300/25 tracking-widest font-mono select-none cursor-default"
        >
          @omeganexuz
        </span>

        <img
          src="/images_20260224_085142_0000.png"
          alt=""
          onClick={() => setSambaAbierto(true)}
          className="fixed bottom-3 right-3 w-8 h-8 object-contain opacity-25 hover:opacity-50 transition-opacity select-none cursor-default z-30"
        />
      </footer>

      <FormularioContacto estaAbierto={modalAbierto} onCerrar={() => setModalAbierto(false)} />
      <AdminSecretModal abierto={adminAbierto} onCerrar={() => setAdminAbierto(false)} />
      <Samba3D abierto={sambaAbierto} onCerrar={() => setSambaAbierto(false)} />
    </div>
  );
}
