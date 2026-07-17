-- ============================================================
-- Kidia: PIN familiar (gate del Modo Familia)
-- Ejecutar en el SQL Editor de Supabase, sobre el proyecto que ya
-- tiene aplicado supabase_schema.sql, 002 y 003.
--
-- El padre define un PIN de 4 dígitos para entrar al Modo Familia
-- desde la vista del niño (doc 02 §1). Se guarda un hash SHA-256
-- (con salt = user id, calculado en el cliente vía WebCrypto), no el
-- PIN en claro. Nota honesta de alcance: el hijo usa la sesión del
-- padre en el mismo navegador, así que esto es una barrera de "no
-- entrar por error", no seguridad fuerte — quien abra las DevTools
-- puede saltársela. Las policies existentes de user_profiles (select/
-- update del propio perfil) ya cubren esta columna.
-- ============================================================

alter table public.user_profiles
  add column if not exists parent_pin_hash text;
