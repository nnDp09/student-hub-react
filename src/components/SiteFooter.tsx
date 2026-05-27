export function SiteFooter() {
  return (
    <footer className="bg-[#003b66] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <h4 className="font-bold mb-3">UNIVERSIDAD</h4>
          <ul className="space-y-2 opacity-90">
            <li>Nuestra Historia</li>
            <li>Federico Santa María</li>
            <li>Definiciones Estratégicas</li>
            <li>Modelo Educativo</li>
            <li>Organización</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">CAMPUS Y SEDES</h4>
          <ul className="space-y-2 opacity-90">
            <li>Información Campus y Sedes</li>
            <li>Tour Virtual</li>
            <li>Política de Privacidad</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">EXTENSIÓN Y CULTURA</h4>
          <ul className="space-y-2 opacity-90">
            <li>Dirección de Comunicaciones</li>
            <li>Vinculación con el Medio</li>
            <li>Asuntos Internacionales</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">DIRECCIÓN DE RELACIONES ESTUDIANTILES</h4>
          <p className="opacity-90">Universidad Técnica Federico Santa María</p>
        </div>
      </div>
      <div className="border-t border-white/20 py-4 text-center text-xs opacity-80">
        © {new Date().getFullYear()} Universidad Técnica Federico Santa María
      </div>
    </footer>
  );
}
