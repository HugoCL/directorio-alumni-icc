import { v } from "convex/values"
import type { Doc } from "./_generated/dataModel"
import { internalMutation } from "./_generated/server"

const MARKER_TOKEN = "seed-directorio-alumni-icc"

type SeedProfile = Omit<
  Doc<"profiles">,
  "_id" | "_creationTime" | "userId" | "updatedAt"
>

const profiles = [
  {
    fullName: "Camila Rojas",
    generation: "2014",
    area: "Software",
    title: "Staff Software Engineer",
    company: "Mercado Libre",
    location: "Santiago, Chile",
    helpWith:
      "Arquitectura backend, entrevistas técnicas y mentoría de carrera.",
    contactEmail: "camila.rojas@alumni.example.com",
    linkedinUrl: "https://www.linkedin.com/in/camila-rojas-icc",
    published: true,
  },
  {
    fullName: "Diego Muñoz",
    generation: "2016",
    area: "Datos e IA",
    title: "Machine Learning Engineer",
    company: "NotCo",
    location: "Santiago, Chile",
    helpWith:
      "Machine learning aplicado, portafolios de datos y transición a IA.",
    contactEmail: "diego.munoz@alumni.example.com",
    published: true,
  },
  {
    fullName: "Francisca Soto",
    generation: "2018",
    area: "Producto",
    title: "Product Manager",
    company: "Buk",
    location: "Talca, Chile",
    helpWith:
      "Descubrimiento de producto, métricas y preparación de entrevistas.",
    contactEmail: "francisca.soto@alumni.example.com",
    phone: "+56 9 5555 0103",
    published: true,
  },
  {
    fullName: "Matías González",
    generation: "2020",
    area: "Investigación",
    title: "Investigador doctoral",
    company: "Universidad de Chile",
    location: "Santiago, Chile",
    helpWith:
      "Postulación a posgrados, investigación aplicada y escritura académica.",
    contactEmail: "matias.gonzalez@alumni.example.com",
    published: true,
  },
  {
    fullName: "Valentina Pérez",
    generation: "2021",
    area: "Emprendimiento",
    title: "Co-fundadora",
    company: "Nativo Labs",
    location: "Curicó, Chile",
    helpWith:
      "Validación de ideas, primeras ventas y postulaciones a fondos públicos.",
    contactEmail: "valentina.perez@alumni.example.com",
    published: true,
  },
  {
    fullName: "Sebastián Silva",
    generation: "2013",
    area: "Academia",
    title: "Profesor asistente",
    company: "Universidad de Talca",
    location: "Talca, Chile",
    helpWith:
      "Carrera académica, docencia universitaria y formulación de proyectos.",
    contactEmail: "sebastian.silva@alumni.example.com",
    published: true,
  },
  {
    fullName: "Antonia Fuentes",
    generation: "2024",
    area: "Software",
    title: "Frontend Developer",
    company: "Empresa Demo",
    location: "Remoto, Chile",
    helpWith: "Desarrollo frontend, revisión de portafolio y primeros empleos.",
    contactEmail: "antonia.fuentes@alumni.example.com",
    published: false,
  },
] satisfies SeedProfile[]

export const run = internalMutation({
  args: {},
  returns: v.object({
    created: v.boolean(),
    users: v.number(),
    profiles: v.number(),
    invites: v.number(),
  }),
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("invites")
      .withIndex("by_token", (q) => q.eq("token", MARKER_TOKEN))
      .unique()

    if (existing) {
      return { created: false, users: 0, profiles: 0, invites: 0 }
    }

    const now = Date.now()

    for (const [index, profile] of profiles.entries()) {
      const inviteId = await ctx.db.insert("invites", {
        email: profile.contactEmail,
        token: index === 0 ? MARKER_TOKEN : `seed-accepted-${index}`,
        status: "accepted",
        acceptedAt: now,
        note: "Datos de prueba",
      })
      const userId = await ctx.db.insert("users", {
        tokenIdentifier: `seed|${index}`,
        clerkUserId: `seed_user_${index}`,
        email: profile.contactEmail,
        name: profile.fullName,
        role: "alumni",
        inviteId,
        profileComplete: true,
        updatedAt: now,
      })

      await ctx.db.insert("profiles", { ...profile, userId, updatedAt: now })
      await ctx.db.patch(inviteId, { acceptedByUserId: userId })
    }

    await ctx.db.insert("invites", {
      email: "pendiente@alumni.example.com",
      token: "seed-pending",
      status: "pending",
      note: "Invitación pendiente de prueba",
    })
    await ctx.db.insert("invites", {
      email: "revocada@alumni.example.com",
      token: "seed-revoked",
      status: "revoked",
      note: "Invitación revocada de prueba",
    })

    return {
      created: true,
      users: profiles.length,
      profiles: profiles.length,
      invites: profiles.length + 2,
    }
  },
})
