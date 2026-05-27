import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Hero } from "@/components/Hero";
import { Beneficios } from "@/components/Beneficios";
import { Servicios } from "@/components/Servicios";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inicio - Dirección de Relaciones Estudiantiles" },
      { name: "description", content: "Dirección de Relaciones Estudiantiles USM" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Beneficios />
        <Servicios />
      </main>
      <SiteFooter />
    </div>
  );
}
