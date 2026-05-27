const items = [
  { title: "Gratuidad", img: "https://rree.usm.cl/wp-content/uploads/2022/12/Beneficios-Estudiantiles-1.png", href: "https://portal.beneficiosestudiantiles.cl/gratuidad" },
  { title: "Portal Beneficios", img: "https://rree.usm.cl/wp-content/uploads/2022/11/1.png", href: "https://portal.beneficiosestudiantiles.cl" },
  { title: "Beneficios USM", img: "https://rree.usm.cl/wp-content/uploads/2023/01/Beneficios-Estudiantiles.png", href: "#" },
  { title: "Becas JUNAEB", img: "https://rree.usm.cl/wp-content/uploads/2023/01/Beneficios-Estudiantiles.png", href: "#" },
  { title: "TNE", img: "https://rree.usm.cl/wp-content/uploads/2023/01/Beneficios-Estudiantiles.png", href: "#" },
  { title: "Crédito CAE", img: "https://rree.usm.cl/wp-content/uploads/2023/01/Beneficios-Estudiantiles.png", href: "#" },
];

export function Beneficios() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-14">
      <h2 className="text-3xl font-bold text-[#003b66] mb-8 border-l-4 border-[#005a9c] pl-3">
        Beneficios Estudiantiles
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((it) => (
          <a
            key={it.title}
            href={it.href}
            target="_blank"
            rel="noopener"
            className="group relative block rounded-lg overflow-hidden shadow hover:shadow-xl transition-shadow bg-white"
          >
            <img src={it.img} alt={it.title} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform" />
            <div className="p-3 text-center text-sm font-semibold text-[#003b66]">{it.title}</div>
          </a>
        ))}
      </div>
    </section>
  );
}
