import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const titles: Record<string, string> = {
  psicologia: "Psicología",
  kinesiologia: "Kinesiología",
  dentista: "Dentista",
  "medico-general": "Médico General",
};

export const Route = createFileRoute("/servicios/$servicio")({
  component: ServicioPage,
  head: ({ params }) => ({
    meta: [{ title: `${titles[params.servicio] ?? "Servicio"} - DRE USM` }],
  }),
});

function ServicioPage() {
  const { servicio } = Route.useParams();
  const title = titles[servicio];
  if (!title) throw notFound();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-[#003b66] text-white py-20">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold border-l-4 border-white pl-4">
              {title}
            </h1>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
