import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/perfil")({
  component: PerfilPage,
});

const titles: Record<string, string> = {
  psicologia: "Psicología",
  kinesiologia: "Kinesiología",
  dentista: "Dentista",
  "medico-general": "Médico General",
  "bienestar-estudiantil": "Bienestar Estudiantil",
};

const PROFESSIONALS: Record<string, string> = {
  "maria-berrios": "María Berríos",
  "cristobal-cortazar": "Cristóbal Cortázar",
  "freddy-vargas": "Freddy Vargas",
  "marisol-rojas": "Marisol Rojas",
  "carmen-cardenas": "Carmen Cárdenas",
  "matias-perez": "Matías Pérez",
  "bernardita-cruchaga": "Bernardita Cruchaga",
  "martina-piulats": "Martina Piulats",
  "stefano-colonelli": "Stefano Colonelli",
};

function PerfilPage() {
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarReservas();
  }, []);

  async function cargarReservas() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("reservas")
      .select("*")
      .eq("user_id", session.user.id)
      .order("fecha", { ascending: true });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setReservas(data || []);
    setLoading(false);
  }

  async function cancelarReserva(id: string) {
    const confirmar = window.confirm(
      "¿Estás seguro de que quieres anular esta hora?"
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("reservas")
      .delete()
      .eq("id", id);

    if (error) {
      alert("No se pudo anular la hora.");
      return;
    }

    setReservas((prev) => prev.filter((r) => r.id !== id));
    alert("Hora anulada correctamente.");
  }

  return (
    <div className="min-h-screen bg-[#f4f7fa] flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="bg-[#003b66] text-white py-10">
          <div className="max-w-7xl mx-auto px-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-3"
            >
              <ArrowLeft size={16} />
              Volver al inicio
            </Link>

            <h1 className="text-4xl font-bold border-l-4 border-white pl-4">
              Mi Perfil
            </h1>

            <p className="text-white/80 mt-2 pl-5">
              Revisa tus horas agendadas.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold text-[#003b66] mb-6">
            Mis horas agendadas
          </h2>

          {loading ? (
            <p>Cargando...</p>
          ) : reservas.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6">
              No tienes horas reservadas.
            </div>
          ) : (
            <div className="space-y-4">
              {reservas.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-lg shadow p-5 border-l-4 border-[#005a9c]"
                >
                  <h3 className="font-bold text-xl text-[#003b66]">
                    {titles[r.servicio] ?? r.servicio}
                  </h3>

                  <p className="mt-2">
                    <strong>Profesional:</strong>{" "}
                    {PROFESSIONALS[r.profesional_id] ?? r.profesional_id}
                  </p>

                  <p>
                    <strong>Fecha:</strong> {r.fecha}
                  </p>

                  <p>
                    <strong>Hora:</strong> {r.hora}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      Confirmada
                    </span>

                    <button
                      onClick={() => cancelarReserva(r.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition"
                    >
                      Anular hora
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}