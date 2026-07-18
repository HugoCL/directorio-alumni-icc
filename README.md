# Red Alumni ICC

Directorio privado en español para conectar estudiantes y alumni verificados.
Stack: Next.js 16, Clerk, Convex y shadcn/ui (preset `b3Y9AjZjyC`).

## Desarrollo

```bash
pnpm install
npx convex dev
pnpm dev
```

Deployment de desarrollo Convex: `precious-kookabura-879` (proyecto `hugo-castro/directorio-alumni-icc`).

## Configurar Clerk

1. Claves en `.env.local`:

```dotenv
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CONVEX_URL=https://….convex.cloud
```

2. En Clerk, activa la integración Convex para exponer `email` y
   `emailVerified`. En el JWT template `convex`, añade el rol administrativo:

```json
{
  "aud": "convex",
  "role": "{{user.public_metadata.role}}"
}
```

3. Configura el issuer en Convex:

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://<instancia>.clerk.accounts.dev
```

4. Para `/admin`, asigna public metadata al usuario:

```json
{ "role": "admin" }
```

## Configurar correos

Verifica un dominio remitente en Resend y configura las variables en Convex:

```bash
npx convex env set RESEND_API_KEY re_...
npx convex env set RESEND_FROM "Red Alumni ICC <red@tu-dominio.cl>"
npx convex env set APP_URL https://tu-aplicacion.cl
```

## Flujo de acceso

1. Clerk autentica y verifica el correo del usuario.
2. Los correos `@alumnos.utalca.cl` obtienen acceso estudiantil automático.
3. Un exalumno solicita revisión en `/verificacion` con nombre, generación y LinkedIn.
4. Un administrador aprueba o rechaza la solicitud en `/admin`.
5. Resend notifica el resultado; los alumni aprobados completan `/perfil`.
6. Solo miembros verificados consultan perfiles publicados en `/directorio`.
