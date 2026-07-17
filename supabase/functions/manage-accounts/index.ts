import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const allowedOrigin = 'https://optimind-store-base.pages.dev';
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};
const response = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: corsHeaders });

function keyFromEnvironment(name: string, legacyName: string) {
  const keys = Deno.env.get(name);
  return keys ? JSON.parse(keys).default : Deno.env.get(legacyName);
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return response({ message: 'Método no permitido.' }, 405);

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return response({ message: 'Sesión requerida.' }, 401);

  const url = Deno.env.get('SUPABASE_URL')!;
  const publishableKey = keyFromEnvironment('SUPABASE_PUBLISHABLE_KEYS', 'SUPABASE_ANON_KEY')!;
  const secretKey = keyFromEnvironment('SUPABASE_SECRET_KEYS', 'SUPABASE_SERVICE_ROLE_KEY')!;
  const userClient = createClient(url, publishableKey, { global: { headers: { Authorization: authorization } } });
  const admin = createClient(url, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return response({ message: 'Sesión inválida.' }, 401);

  const { data: platformRoles, error: roleError } = await admin.from('store_members').select('role').eq('user_id', user.id).eq('role', 'platform_admin').limit(1);
  if (roleError || !platformRoles?.length) return response({ message: 'No tenés permiso para crear accesos.' }, 403);

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const storeId = typeof body?.store_id === 'string' ? body.store_id : '';
  const role = body?.role === 'editor' ? 'editor' : body?.role === 'owner' ? 'owner' : '';
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 12 || !/^[0-9a-f-]{36}$/i.test(storeId) || !role) return response({ message: 'Revisá email, contraseña (mínimo 12 caracteres), tienda y permiso.' }, 400);

  const { data: created, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (createError || !created.user) return response({ message: 'No se pudo crear la cuenta. Puede que ese email ya exista.' }, 409);

  const { error: membershipError } = await admin.from('store_members').insert({ store_id: storeId, user_id: created.user.id, role });
  if (membershipError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return response({ message: 'No se pudo asignar la tienda. No se creó ningún acceso.' }, 500);
  }
  return response({ id: created.user.id, email: created.user.email, role }, 201);
});
