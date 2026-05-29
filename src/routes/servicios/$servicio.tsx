import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, X, CheckCircle2, LogOut } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Session } from "@supabase/supabase-js";

const titles: Record<string, string> = {
  psicologia: "Psicología",
  kinesiologia: "Kinesiología",
  dentista: "Dentista",
  "medico-general": "Médico General",
};

// Bloques de 40 min desde las 9:00 hasta las 14:00
const SLOTS = ["09:00", "09:40", "10:20", "11:00", "11:40", "12:20", "13:00"];

const EMAIL_DOMAIN = "@usm.cl";

// Definición de profesionales y sus disponibilidades
const PROFESSIONALS = {
  "diego-prokes": { name: "Diego Prokes" },
  "benjamin-soto": { name: "Benjamin Soto" },
  "julio-urbina": { name: "Julio Urbina" },
};

// Profesionales disponibles por hora (día de semana: 0=domingo, 1=lunes, 2=martes, 3=miércoles, 4=jueves, 5=viernes, 6=sábado)
const AVAILABILITY: Record<string, string[]> = {
  "09:00": ["diego-prokes"],
  "09:40": ["diego-prokes"],
  "10:20": ["diego-prokes"],
  "11:00": ["benjamin-soto"],
  "11:40": ["julio-urbina"],
  "12:20": ["julio-urbina"],
  "13:00": ["julio-urbina"],
};

// Profesionales que trabajan por día
const WORK_DAYS: Record<number, string[]> = {
  1: ["diego-prokes", "benjamin-soto", "julio-urbina"], // lunes
  2: [], // martes - NO TRABAJAN (no clickeable)
  3: ["diego-prokes", "benjamin-soto", "julio-urbina"], // miércoles
  4: ["diego-prokes", "benjamin-soto", "julio-urbina"], // jueves
  5: ["diego-prokes", "benjamin-soto"], // viernes (sin julio-urbina)
};

export const Route = createFileRoute("/servicios/$servicio")({
  component: ServicioPage,
  head: ({ params }) => ({
    meta: [{ title: `${titles[params.servicio] ?? "Servicio"} - DRE USM` }],
  }),
});

function toDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface Reserva {
  id: string;
  user_id: string;
  user_email: string;
  servicio: string;
  fecha: string;
  hora: string;
  profesional_id: string;
}

function capacityForDate(date: Date) {
  const dow = date.getDay();
  const working = WORK_DAYS[dow as keyof typeof WORK_DAYS] ?? [];
  let cap = 0;
  for (const hora of SLOTS) {
    const pros = (AVAILABILITY[hora] ?? []).filter((p) => working.includes(p));
    cap += pros.length;
  }
  return cap;
}

function ServicioPage() {
  const { servicio } = Route.useParams();
  const title = titles[servicio];
  if (!title) throw notFound();

  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f7fa] flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-[#003b66] text-white py-12">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-3"
              >
                <ArrowLeft size={16} /> Volver a la página principal
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold border-l-4 border-white pl-4">
                {title}
              </h1>
              <p className="text-white/80 mt-2 pl-5">Servicio Estudiantil · DRE USM</p>
            </div>
            {session && (
              <div className="text-sm text-white/90 flex items-center gap-3">
                <span>{session.user.email}</span>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded"
                >
                  <LogOut size={14} /> Salir
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-10">
          {!authReady ? (
            <p className="text-gray-500">Cargando…</p>
          ) : session ? (
            <BookingPanel servicio={servicio} session={session} />
          ) : (
            <AuthPanel />
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function AuthPanel() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.toLowerCase().endsWith(EMAIL_DOMAIN)) {
      toast.error(`Debes usar tu correo institucional ${EMAIL_DOMAIN}`);
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}` },
        });
        if (error) throw error;
        toast.success("Cuenta creada. Ya puedes agendar tu hora.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Sesión iniciada");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ocurrió un error";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6 border-t-4 border-[#005a9c]">
      <h2 className="text-2xl font-bold text-[#003b66] mb-1">
        {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
      </h2>
      <p className="text-sm text-gray-600 mb-5">
        Usa tu correo institucional <span className="font-semibold">{EMAIL_DOMAIN}</span> para
        agendar una hora.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Correo institucional</Label>
          <Input
            id="email"
            type="email"
            placeholder={`tucorreo${EMAIL_DOMAIN}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#005a9c] hover:bg-[#003b66] text-white"
        >
          {loading ? "..." : mode === "login" ? "Ingresar" : "Crear cuenta"}
        </Button>
      </form>
      <button
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        className="mt-4 text-sm text-[#005a9c] hover:underline"
      >
        {mode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
    </div>
  );
}

function BookingPanel({ servicio, session }: { servicio: string; session: Session }) {
  const title = titles[servicio] ?? servicio;
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReservas = async () => {
    const { data, error } = await supabase
      .from("reservas")
      .select("*")
      .eq("servicio", servicio);
    if (error) {
      toast.error("No se pudieron cargar las reservas");
      return;
    }
    setReservas((data ?? []) as Reserva[]);
  };

  useEffect(() => {
    loadReservas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicio]);

  // Agrupa reservas por fecha para colorear el calendario
  const byDate = useMemo(() => {
    const map = new Map<string, Reserva[]>();
    for (const r of reservas) {
      const list = map.get(r.fecha) ?? [];
      list.push(r);
      map.set(r.fecha, list);
    }
    return map;
  }, [reservas]);

  const fullDays = useMemo(() => {
    const days: Date[] = [];
    for (const [fecha, list] of byDate) {
      const [y, m, d] = fecha.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      const cap = capacityForDate(date);
      if (cap > 0 && list.length >= cap) days.push(date);
    }
    return days;
  }, [byDate]);

  const partialDays = useMemo(() => {
    const days: Date[] = [];
    for (const [fecha, list] of byDate) {
      const [y, m, d] = fecha.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      const cap = capacityForDate(date);
      if (cap > 0 && list.length > 0 && list.length < cap) days.push(date);
    }
    return days;
  }, [byDate]);

  const dateKey = selectedDate ? toDateKey(selectedDate) : null;
  const todayReservas = dateKey ? (byDate.get(dateKey) ?? []) : [];
  const myReservaToday = todayReservas.find((r) => r.user_id === session.user.id);

  const isPastDate = (d: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Deshabilitar si es pasado o si es martes (día 2)
    return d < today || d.getDay() === 2;
  };

  const handleReservar = async (hora: string, profesional_id: string) => {
    if (!dateKey) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("reservas").insert({
        user_id: session.user.id,
        user_email: session.user.email ?? "",
        servicio,
        fecha: dateKey,
        hora,
        profesional_id,
      });
      if (error) throw error;
      toast.success(`Hora confirmada: ${dateKey} a las ${hora}`);
      await loadReservas();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo reservar";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("reservas").delete().eq("id", id);
      if (error) throw error;
      toast.success("Reserva cancelada");
      await loadReservas();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo cancelar";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const dayFull = todayReservas.length >= SLOTS.length;

  // Obtener profesionales disponibles para una hora específica en el día seleccionado
  const getAvailableProfessionals = (hora: string): string[] => {
    if (!selectedDate) return [];
    const dayOfWeek = selectedDate.getDay();
    const workingProfessionals = WORK_DAYS[dayOfWeek as keyof typeof WORK_DAYS] ?? [];
    const professionalsByHour = AVAILABILITY[hora] ?? [];
    
    // Retornar profesionales que trabajan ese día Y están disponibles en esa hora
    return professionalsByHour.filter(p => workingProfessionals.includes(p));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8">
      <div className="bg-white rounded-lg shadow p-4 border-t-4 border-[#005a9c]">
        <h3 className="text-lg font-bold text-[#003b66] mb-3 px-1">Selecciona un día</h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={isPastDate}
          modifiers={{ full: fullDays, partial: partialDays }}
          modifiersClassNames={{
            full: "bg-red-500 text-white hover:bg-red-600",
            partial: "bg-yellow-400 text-black hover:bg-yellow-500",
          }}
          className="pointer-events-auto"
        />
        <div className="mt-4 space-y-2 text-xs px-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded bg-yellow-400" /> Con horas disponibles
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded bg-red-500" /> Día completo
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border-t-4 border-[#005a9c]">
        <h3 className="text-lg font-bold text-[#003b66] mb-1">
          Horas {selectedDate && `· ${dateKey}`}
        </h3>
        <p className="text-sm text-gray-600 mb-5">
          Bloques de 40 minutos entre las 9:00 y las 14:00. Los martes no hay atención disponible.
        </p>  

        {myReservaToday && (
          <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="text-green-600 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="font-semibold text-green-900">¡Hora confirmada!</p>
              <p className="text-sm text-green-800">
                Tu reserva de {title} está agendada para el {myReservaToday.fecha} a las{" "}
                {myReservaToday.hora}.
              </p>
            </div>
            <button
              onClick={() => handleCancelar(myReservaToday.id)}
              disabled={loading}
              title="Cancelar reserva"
              className="text-red-600 hover:bg-red-100 rounded-full p-1"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {dayFull && !myReservaToday && (
          <p className="mb-4 text-red-600 font-medium">
            Este día está completo. Selecciona otro día.
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {SLOTS.map((hora) => {
            const availableProfessionals = getAvailableProfessionals(hora);
            const slotReservas = todayReservas.filter((r) => r.hora.startsWith(hora));
            const takenProIds = new Set(slotReservas.map((r) => r.profesional_id));
            const freePros = availableProfessionals.filter((p) => !takenProIds.has(p));
            const mineHere = slotReservas.find((r) => r.user_id === session.user.id);
            const hasAvailability = availableProfessionals.length > 0;
            const fullyTaken = hasAvailability && freePros.length === 0;

            return (
              <div
                key={hora}
                className={cn(
                  "relative rounded-md p-3 text-center border font-medium",
                  mineHere
                    ? "bg-green-100 border-green-400 text-green-900"
                    : fullyTaken
                    ? "bg-red-100 border-red-300 text-red-700"
                    : hasAvailability
                    ? "bg-yellow-50 border-yellow-300 text-yellow-900 hover:bg-yellow-100 cursor-pointer"
                    : "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed",
                )}
                onClick={() => {
                  if (!mineHere && !myReservaToday && freePros.length > 0) {
                    handleReservar(hora, freePros[0]);
                  }
                }}
              >
                {hora}
                {mineHere && (
                  <div className="text-[10px] mt-1 uppercase tracking-wide">
                    Tu reserva ·{" "}
                    {PROFESSIONALS[mineHere.profesional_id as keyof typeof PROFESSIONALS]?.name ??
                      mineHere.profesional_id}
                  </div>
                )}
                {!mineHere && fullyTaken && (
                  <div className="text-[10px] mt-1 uppercase tracking-wide">Ocupada</div>
                )}
                {!mineHere && !fullyTaken && hasAvailability && (
                  <div className="text-[10px] mt-1 text-gray-700">
                    {freePros
                      .map(
                        (p) =>
                          PROFESSIONALS[p as keyof typeof PROFESSIONALS]?.name ?? p,
                      )
                      .join(", ")}
                  </div>
                )}
                {mineHere && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelar(mineHere.id);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                    title="Cancelar"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {!myReservaToday && !dayFull && (
          <p className="mt-5 text-xs text-gray-500">
            Solo puedes mantener una reserva activa por día en este servicio. Haz clic en una hora
            amarilla para confirmar.
          </p>
        )}
      </div>
    </div>
  );
}
