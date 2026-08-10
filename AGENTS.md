# AGENTS.md

## Cuentas de prueba Clerk

En el ambiente de desarrollo puedes iniciar sesión con estas cuentas:

- `alumni+clerk_test@example.com` — rol `alumni`
- `admin+clerk_test@example.com` — rol `admin`
- `alumno+clerk_test@example.com` — rol `student`

Elige acceso con código por correo y usa `424242`. Clerk reconoce el sufijo
`+clerk_test` en instancias de desarrollo, por lo que no envía un correo real.

## Pruebas locales

Prueba siempre la aplicación localmente en `http://localhost:3000`. No uses la
IP de la red local, porque cambia el origen esperado por Clerk.

## Learned User Preferences

- La interfaz y el copy deben estar en español.
- El diseño debe sentirse pulido y neutral; evitar gradientes y estética genérica tipo "AI slop".
- Para trabajo visual, el usuario espera calidad al nivel de frontend-skill y frontend-design.

## Learned Workspace Facts

- Directorio privado invite-only para la Comunidad ICC (Ingeniería Civil en Computación, UTalca); los alumni publican contacto para que estudiantes los encuentren.
- Los roles de usuario son `admin`, `alumni` y `student`, definidos en el public metadata de Clerk.
- Para asignar admin en desarrollo: pon `{ "role": "admin" }` en el public metadata de Clerk y recarga.
- Esta página no es un sitio oficial ni está afiliada a la Universidad de Talca.
