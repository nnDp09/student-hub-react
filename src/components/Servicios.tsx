import { Link } from "@tanstack/react-router";
import { Brain, Activity, Smile, Stethoscope, HandHeart } from "lucide-react";

const servicios = [
  {
    to: "/servicios/psicologia",
    title: "Psicología",
    icon: Brain,
    desc: "Apoyo emocional y orientación psicológica para estudiantes.",
  },
  {
    to: "/servicios/kinesiologia",
    title: "Kinesiología",
    icon: Activity,
    desc: "Evaluación y tratamiento de lesiones y molestias físicas.",
  },
  {
    to: "/servicios/dentista",
    title: "Dentista",
    icon: Smile,
    desc: "Atención odontológica preventiva y de urgencia.",
  },
  {
    to: "/servicios/medico-general",
    title: "Médico General",
    icon: Stethoscope,
    desc: "Consultas médicas, diagnóstico y derivación.",
  },
  {
    to: "/servicios/bienestar-estudiantil",
    title: "Bienestar Estudiantil",
    icon: HandHeart,
    desc: "Apoyo social y orientación para estudiantes.",
  },
] as const;

export function Servicios() {
  return (
    <section id="servicios" className="bg-[#f4f7fa]">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="text-3xl font-bold text-[#003b66] mb-8 border-l-4 border-[#005a9c] pl-3">
          Servicios Estudiantiles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicios.map(({ to, title, icon: Icon, desc }) => {
            const servicioId = to.replace("/servicios/", "");
            return (
            <Link
              key={to}
              to="/servicios/$servicio"
              params = {{servicio: servicioId}}
              className="group bg-white rounded-lg shadow hover:shadow-xl transition-all p-6 border-t-4 border-[#005a9c] flex flex-col"
            >
              <div className="w-14 h-14 rounded-full bg-[#005a9c]/10 text-[#005a9c] grid place-items-center mb-4 group-hover:bg-[#005a9c] group-hover:text-white transition-colors">
                <Icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#003b66] mb-2">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed flex-1">{desc}</p>
              <span className="mt-4 text-[#005a9c] text-sm font-semibold group-hover:underline">
                Ver más →
              </span>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
