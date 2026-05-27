CREATE TABLE public.reservas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  servicio text NOT NULL,
  fecha date NOT NULL,
  hora time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (servicio, fecha, hora)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservas TO authenticated;
GRANT SELECT ON public.reservas TO anon;
GRANT ALL ON public.reservas TO service_role;

ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- Anyone (logged in or not) can see availability
CREATE POLICY "Reservas son visibles por todos" ON public.reservas
  FOR SELECT TO anon, authenticated USING (true);

-- Only authenticated users can insert reservas for themselves
CREATE POLICY "Usuarios crean sus propias reservas" ON public.reservas
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Only the owner can delete (cancel) their reserva
CREATE POLICY "Usuarios cancelan sus propias reservas" ON public.reservas
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_reservas_servicio_fecha ON public.reservas (servicio, fecha);