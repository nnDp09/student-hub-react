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
import { set } from "date-fns";

const titles: Record<string, string> = {
  psicologia: "Psicología",
  kinesiologia: "Kinesiología",
  dentista: "Dentista",
  "medico-general": "Médico General",
  "bienestar-estudiantil": "Bienestar Estudiantil",
};

// Bloques de 30 min desde las 9:00 hasta las 17:00
const SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];

const EMAIL_DOMAIN = "@usm.cl";

// Definición de profesionales y sus disponibilidades
const PROFESSIONALS = {
  "maria-berrios": { name: "María Berríos", servicio: "psicologia" },
  "cristobal-cortazar": { name: "Cristóbal Cortázar", servicio: "psicologia" },
  "freddy-vargas": { name: "Freddy Vargas", servicio: "kinesiologia" },
  "marisol-rojas": { name: "Marisol Rojas", servicio: "bienestar-estudiantil" },
  "carmen-cardenas": { name: "Carmen Cárdenas", servicio: "bienestar-estudiantil" },
  "matias-perez": { name: "Matías Pérez", servicio: "dentista" },
  "bernardita-cruchaga": { name: "Bernardita Cruchaga", servicio: "dentista" },
  "martina-piulats": { name: "Martina Piulats", servicio: "medico-general" },
  "stefano-colonelli": { name: "Stefano Colonelli", servicio: "medico-general" },
};

// Profesionales disponibles por hora (día de semana: 0=domingo, 1=lunes, 2=martes, 3=miércoles, 4=jueves, 5=viernes, 6=sábado)
const AVAILABILITY: Record<string, string[]> = {
  "09:00": ["matias-perez", "maria-berrios", "marisol-rojas", "carmen-cardenas"],
  "09:30": ["matias-perez", "bernardita-cruchaga", "marisol-rojas", "carmen-cardenas"],
  "10:00": ["maria-berrios", "cristobal-cortazar", "marisol-rojas", "carmen-cardenas"],
  "10:30": ["freddy-vargas", "stefano-colonelli", "marisol-rojas", "carmen-cardenas"],
  "11:00": ["freddy-vargas", "maria-berrios", "marisol-rojas", "carmen-cardenas"],
  "11:30": ["marisol-rojas", "stefano-colonelli", "marisol-rojas", "carmen-cardenas"],
  "12:00": ["matias-perez", "bernardita-cruchaga", "marisol-rojas", "carmen-cardenas"],
  "12:30": ["matias-perez", "bernardita-cruchaga", "marisol-rojas", "carmen-cardenas"],
  "13:00": ["freddy-vargas", "stefano-colonelli", "carmen-cardenas"],
  "13:30": ["martina-piulats", "maria-berrios", "carmen-cardenas"],
  "14:00": ["martina-piulats", "stefano-colonelli", "marisol-rojas"],
  "14:30": ["martina-piulats", "cristobal-cortazar", "marisol-rojas"],
  "15:00": ["martina-piulats", "stefano-colonelli", "marisol-rojas"],
  "15:30": ["freddy-vargas", "marisol-rojas"],
  "16:00": ["martina-piulats", "cristobal-cortazar", "stefano-colonelli", "carmen-cardenas"],
  "16:30": ["martina-piulats", "marisol-rojas"],
  "17:00": ["matias-perez", "marisol-rojas"],
};

// Profesionales que trabajan por día
const WORK_DAYS: Record<number, string[]> = {
  1: ["maria-berrios", "freddy-vargas", "marisol-rojas", "matias-perez", "stefano-colonelli"], // lunes
  2: ["bernardita-cruchaga", "cristobal-cortazar", "stefano-colonelli", "carmen-cardenas"], // martes
  3: ["maria-berrios", "freddy-vargas", "marisol-rojas", "matias-perez", "martina-piulats", "bernardita-cruchaga"], // miércoles
  4: ["maria-berrios", "freddy-vargas","matias-perez"], // jueves
  5: ["maria-berrios", "freddy-vargas", "cristobal-cortazar", "stefano-colonelli", "marisol-rojas", "carmen-cardenas"], // viernes 
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

          <p className="mt-2 text-sm text-gray-500">Debe contener al menos 8 caracteres, una letra mayúscula, un número y un carácter especial.</p>
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
  const [selectedProfesional, setSelectedProfesional] = useState<string | null>(null);
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
    setReservas((data ?? []) as unknown as Reserva[]);
  };

  useEffect(() => {
    loadReservas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicio]);

  useEffect(() => {
    setSelectedDate(new Date());
  }, [selectedProfesional]);

  // Filtrar los profesionales que pertenecen a este servicio actual
  const professionalsInService = useMemo(() => {
    return Object.entries(PROFESSIONALS).filter(
      ([_, prof]) => prof.servicio === servicio
    );
  }, [servicio]);

  // Obtener las reservas del día seleccionado para el profesional seleccionado
  const dateKey = selectedDate ? toDateKey(selectedDate) : null;
  
  const todayReservasPorProfesional = useMemo(() => {
    if (!dateKey || !selectedProfesional) return [];
    return reservas.filter(
      (r) => r.fecha === dateKey && r.profesional_id === selectedProfesional
    );
  }, [reservas, dateKey, selectedProfesional]);

  const myReservaToday = useMemo(() => {
    if (!dateKey) return null;
    return reservas.find(
      (r) => r.fecha === dateKey && r.user_id === session.user.id
    );
  }, [reservas, dateKey, session.user.id]);

  // Verificar si el profesional seleccionado trabaja el día de la semana elegido
  const profesionalTrabajaHoy = useMemo(() => {
    if (!selectedDate || !selectedProfesional) return false;
    const dayOfWeek = selectedDate.getDay();
    const workingProfessionals = WORK_DAYS[dayOfWeek as keyof typeof WORK_DAYS] ?? [];
    return workingProfessionals.includes(selectedProfesional);
  }, [selectedDate, selectedProfesional]);

  // Modificador del calendario: Deshabilitar días pasados o días que el profesional NO trabaja
  const isPastOrUnavailableDate = (d: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Reglas generales (pasado, fin de semana)
    if (d < today || d.getDay() === 6 || d.getDay() === 0) {
      return true;
    }

    // Si ya hay un profesional seleccionado, deshabilitar los días en que él NO trabaja
    if (selectedProfesional) {
      const dayOfWeek = d.getDay();
      const workingProfessionals = WORK_DAYS[dayOfWeek as keyof typeof WORK_DAYS] ?? [];
      return !workingProfessionals.includes(selectedProfesional);
    }
    return false;
  };

  // Verificar si una hora específica está disponible para el profesional seleccionado
  const isSlotAvailable = (hora: string) => {
    if (!selectedProfesional || !profesionalTrabajaHoy) return false;
    
    // 1. Ver si el profesional está asignado a esta hora en la constante AVAILABILITY
    const professionalsByHour = AVAILABILITY[hora] ?? [];
    const tieneBloqueHorario = professionalsByHour.includes(selectedProfesional);
    
    // 2. Ver si ya está ocupado por otra reserva
    const estaOcupado = todayReservasPorProfesional.some((r) => r.hora.startsWith(hora));

    return tieneBloqueHorario && !estaOcupado;
  };

  const handleReservar = async (hora: string) => {
    if (!dateKey || !selectedProfesional) return;
    setLoading(true);
    try {
      console.log("Intentando reservar:");
      const { error } = await supabase.from("reservas").insert({
        user_id: session.user.id,
        user_email: session.user.email ?? "",
        servicio,
        fecha: dateKey,
        hora,
        profesional_id: selectedProfesional,
      });
      if (error){
        console.error("Error al reservar:", error);
        alert("Fallo al reservar: " + error.message);
        throw error;} 

      alert("¡Hora reservada con éxito!");
      toast.success(`Hora confirmada con éxito`);
      await loadReservas();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo reservar";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (id: string) => {
    const confirmacion = window.confirm("¿Estás seguro de que quieres cancelar esta reserva?");
    if (!confirmacion) return;
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

  return (
    <div className="space-y-8">
      {/* PASO 1: SELECCIÓN DE PROFESIONAL */}
      <div className="bg-white rounded-lg shadow p-6 border-t-4 border-[#005a9c]">
        <h3 className="text-xl font-bold text-[#003b66] mb-2">1. Selecciona un profesional</h3>
        <p className="text-sm text-gray-600 mb-4">
          Para garantizar la continuidad de tu atención en {title}, elige tu profesional:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {professionalsInService.map(([id, prof]) => {
            const isSelected = selectedProfesional === id;
            return (
              <button
                key={id}
                onClick={() => setSelectedProfesional(id)}
                className={cn(
                  "p-4 border rounded-xl text-left transition-all",
                  isSelected
                    ? "border-[#005a9c] bg-blue-50/50 ring-2 ring-[#005a9c]"
                    : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                )}
              >
                <p className="font-bold text-[#003b66] text-lg">{prof.name}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* PASO 2: CALENDARIO Y HORAS (Solo se muestra de forma activa si hay un profesional seleccionado) */}
      {selectedProfesional ? (
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 animate-in fade-in duration-300">
          {/* Columna Calendario */}
          <div className="bg-white rounded-lg shadow p-4 border-t-4 border-[#005a9c]">
            <h3 className="text-lg font-bold text-[#003b66] mb-3 px-1">2. Selecciona un día</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={isPastOrUnavailableDate}
              className="pointer-events-auto"
            />
            <p className="mt-3 text-[11px] text-gray-500 max-w-[260px] px-1">
              Los días deshabilitados corresponden a fechas pasadas, días sin atención o días en que el profesional seleccionado no asiste.
            </p>
          </div>

          {/* Columna Horas */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-[#005a9c]">
            <h3 className="text-lg font-bold text-[#003b66] mb-1">
              3. Horas Disponibles {selectedDate && `· ${dateKey}`}
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              Bloques disponibles para atención con{" "}
              <span className="font-semibold text-[#005a9c]">
                {PROFESSIONALS[selectedProfesional as keyof typeof PROFESSIONALS]?.name}
              </span>.
            </p>

            {myReservaToday && (
              <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="text-green-600 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="font-semibold text-green-900">¡Ya tienes una hora registrada hoy!</p>
                  <p className="text-sm text-green-800">
                    Tu reserva de {titles[myReservaToday.servicio] ?? myReservaToday.servicio} está agendada para las {myReservaToday.hora}.
                  </p>
                </div>
                <button
                  onClick={() => handleCancelar(myReservaToday.id)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-md transition-colors whitespace-nowrap"                >
                  Cancelar reserva
                </button>
              </div>
            )}

            {!profesionalTrabajaHoy ? (
              <p className="text-amber-600 font-medium bg-amber-50 p-3 rounded-lg border border-amber-200">
                Este profesional no atiende los días {selectedDate?.toLocaleDateString('es-CL', { weekday: 'long' })}. Por favor selecciona otro día en el calendario.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {SLOTS.map((hora) => {
                  const disponible = isSlotAvailable(hora);
                  // Ver si está ocupada globalmente o específicamente por mí
                  const ocupadaPorAlguien = todayReservasPorProfesional.find((r) => r.hora.startsWith(hora));
                  const esMia = ocupadaPorAlguien?.user_id === session.user.id;

                  return (
                    <div
                      key={hora}
                      className={cn(
                        "relative rounded-md p-3 text-center border font-medium transition-all",
                        esMia
                          ? "bg-green-100 border-green-400 text-green-900"
                          : ocupadaPorAlguien
                          ? "bg-red-100 border-red-300 text-red-400 cursor-not-allowed"
                          : disponible
                          ? "bg-yellow-50 border-yellow-300 text-yellow-900 hover:bg-yellow-100 cursor-pointer"
                          : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" // No tiene bloque ese día/hora
                      )}
                      onClick={() => {
                        console.log({ hora, disponible, myReservaToday });
                        if (!disponible ){
                          alert("Esta hora no está disponible. Por favor elige otra.");
                          return;
                        } 
                        if (myReservaToday) {
                          alert("Ya tienes una reserva para hoy. Solo puedes tener una reserva por día.");
                          return;
                        }
                        handleReservar(hora);
                      }}
                    >
                      {hora}
                      {esMia && (
                        <div className="text-[10px] mt-1 uppercase tracking-wide text-green-700">Tu hora</div>
                      )}
                      {!esMia && ocupadaPorAlguien && (
                        <div className="text-[10px] mt-1 uppercase tracking-wide text-red-500">Ocupado</div>
                      )}
                      {!ocupadaPorAlguien && !disponible && (
                        <div className="text-[10px] mt-1 text-gray-400">No disponible</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Estado de espera si no ha elegido profesional */
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">
            Por favor, selecciona un profesional arriba para ver sus días y horarios disponibles.
          </p>
        </div>
      )}
    </div>
  );
}
