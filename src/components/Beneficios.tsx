const items = [
  {
    title: "Gratuidad",
    img: "https://rree.usm.cl/wp-content/uploads/2022/12/Beneficios-Estudiantiles-1.png",
    href: "https://portal.beneficiosestudiantiles.cl/gratuidad",
    overlay: "bg-green-600/45",
    buttonColor: "border-green-600 text-green-700",
  },
  {
    title: "Portal Beneficios",
    img: "https://rree.usm.cl/wp-content/uploads/2022/11/1.png",
    href: "https://portal.beneficiosestudiantiles.cl",
    overlay: "bg-blue-600/45",
    buttonColor: "border-blue-600 text-blue-700",
  },
  {
    title: "Beneficios USM",
    img: "https://rree.usm.cl/wp-content/uploads/2022/11/2-1.png",
    href: "#",
    overlay: "bg-teal-600/45",
    buttonColor: "border-teal-600 text-teal-700",
  },
  {
    title: "Becas JUNAEB",
    img: "https://rree.usm.cl/wp-content/uploads/2022/11/3-1.png",
    href: "#",
    overlay: "bg-orange-500/45",
    buttonColor: "border-orange-500 text-orange-600",
  },
  {
    title: "TNE",
    img: "https://rree.usm.cl/wp-content/uploads/2022/11/4-1.png",
    href: "#",
    overlay: "bg-purple-600/45",
    buttonColor: "border-purple-600 text-purple-700",
  },
  {
    title: "Crédito CAE",
    img: "https://rree.usm.cl/wp-content/uploads/2023/01/Beneficios-Estudiantiles.png",
    href: "#",
    overlay: "bg-cyan-600/45",
    buttonColor: "border-cyan-600 text-cyan-700",
  },
];
export function Beneficios() {
  return (
    <section id="beneficios" className="max-w-7xl mx-auto px-4 py-14">
      <h2 className="text-3xl font-bold text-[#003b66] mb-8 border-l-4 border-[#005a9c] pl-3">
        Beneficios Estudiantiles
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((it) => (
          <a
            key={it.title}
            href={it.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-lg overflow-hidden shadow hover:shadow-xl transition-shadow bg-white"
          >
            <div className="relative h-36 overflow-hidden">
              <img
                src={it.img}
                alt={it.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />

              <div className={`absolute inset-0 ${it.overlay}`} />

              
            </div>

            <div className="p-4 text-center">
              <p className="text-sm font-semibold text-[#003b66]">
                {it.title}
              </p>

              <button
               className={`mt-3 w-full rounded-md py-2 text-sm font-semibold border transition hover:bg-gray-50 ${it.buttonColor}`}
              >
              Ver más
              </button>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}