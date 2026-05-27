import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="w-full">
      {/* Top bar */}
      <div className="bg-[#005a9c] text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-10">
          <div className="flex items-center gap-6">
            <a href="https://usm.cl" className="font-semibold hover:underline">USM.cl</a>
            <span className="opacity-90">Accesibilidad ▾</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="opacity-90 mr-2">Emergencias</span>
            <span className="bg-[#7ed957] text-[#003b66] px-3 py-1 rounded text-xs font-semibold">Ley 21.790 "Yo Cuido, Yo Estudio"</span>
            <span className="bg-[#f5c518] text-[#003b66] px-3 py-1 rounded text-xs font-semibold">Activación BAES 2026</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-24">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#003b66] grid place-items-center text-white font-bold">USM</div>
            <div className="leading-tight">
              <div className="text-[11px] font-bold tracking-wide text-[#003b66]">
                UNIVERSIDAD TECNICA<br />FEDERICO SANTA MARIA
              </div>
              <div className="text-[10px] text-gray-500 border-l pl-2 ml-0 mt-1">
                DIRECCIÓN DE RELACIONES ESTUDIANTILES
              </div>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-8 text-[15px] text-[#1f1f1f]">
            <Link to="/" className="hover:text-[#005a9c] font-medium">Inicio</Link>
            <a href="#" className="hover:text-[#005a9c]">Quiénes somos</a>
            <button className="flex items-center gap-1 hover:text-[#005a9c]">Áreas <ChevronDown size={14} /></button>
            <a href="#" className="hover:text-[#005a9c]">Publicaciones</a>
            <a href="#" className="hover:text-[#005a9c]">Contacto</a>
          </nav>
        </div>
      </div>
    </header>
  );
}
