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
