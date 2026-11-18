export default function Navbar({ onAbrirContacto }) {
  return (
    <nav className="bg-[#050811]/90 backdrop-blur-md border-b border-amber-500/20 text-white px-6 py-4 sticky top-0 z-40">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]" />
          <h1 className="text-xl font-extrabold tracking-wider uppercase">
            <span className="text-white">Aether</span>
            <span className="text-amber-400">3D</span>
          </h1>
        </div>

        <div className="flex items-center space-x-6">
          <a href="#galeria" className="text-sm text-blue-200 hover:text-amber-400 transition hidden sm:inline">
            Galería Interactiva
          </a>
          <button
            onClick={onAbrirContacto}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm px-5 py-2 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.35)] transition transform hover:scale-105"
          >
            Contacto
          </button>
        </div>
      </div>
    </nav>
  );
}