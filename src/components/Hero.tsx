export function Hero() {
  return (
    <section
      className="relative h-[420px] bg-cover bg-center"
      style={{ backgroundImage: "url(https://rree.usm.cl/wp-content/uploads/2026/04/CABECERA-WEB.jpg)" }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative max-w-7xl mx-auto px-4 h-full flex items-end pb-12">
        <div className="text-white max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight drop-shadow">
            Dirección de Relaciones Estudiantiles
          </h1>
          <p className="mt-3 text-lg opacity-90">Bienvenidos y bienvenidas</p>
        </div>
      </div>
    </section>
  );
}
