"use node"

import type { ReactNode } from "react"
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "react-email"
import { Resend } from "resend"
import { v } from "convex/values"
import { internalAction } from "./_generated/server"

const colors = {
  ink: "#050403",
  muted: "#5f6563",
  teal: "#007b70",
  surface: "#f2f4f3",
  white: "#ffffff",
}

function EmailLayout({
  preview,
  children,
}: {
  preview: string
  children: ReactNode
}) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: colors.surface,
          color: colors.ink,
          fontFamily: "Arial, sans-serif",
          margin: 0,
          padding: "32px 12px",
        }}
      >
        <Container
          style={{
            backgroundColor: colors.white,
            borderRadius: "12px",
            margin: "0 auto",
            maxWidth: "560px",
            padding: "36px",
          }}
        >
          <Text
            style={{
              color: colors.teal,
              fontSize: "14px",
              fontWeight: 700,
              margin: "0 0 24px",
            }}
          >
            Red Alumni ICC
          </Text>
          {children}
          <Hr style={{ borderColor: "#dfe4e2", margin: "32px 0 20px" }} />
          <Text style={{ color: colors.muted, fontSize: "12px", margin: 0 }}>
            Este correo fue enviado por la red privada de Ingeniería Civil en
            Computación de la Universidad de Talca.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

function VerificationResultEmail({
  name,
  approved,
  rejectionReason,
  appUrl,
}: {
  name: string
  approved: boolean
  rejectionReason?: string
  appUrl: string
}) {
  return (
    <EmailLayout
      preview={
        approved
          ? "Tu cuenta fue verificada"
          : "Resultado de tu solicitud de acceso"
      }
    >
      <Heading
        style={{ fontSize: "28px", lineHeight: 1.2, margin: "0 0 16px" }}
      >
        {approved ? "Tu cuenta fue verificada" : "Revisamos tu solicitud"}
      </Heading>
      <Text style={{ fontSize: "16px", lineHeight: 1.6 }}>
        Hola {name},{" "}
        {approved
          ? "tu acceso fue aprobado."
          : "por ahora no pudimos aprobar tu acceso."}
      </Text>
      {!approved ? (
        <Section
          style={{
            backgroundColor: colors.surface,
            borderRadius: "8px",
            margin: "20px 0",
            padding: "4px 20px",
          }}
        >
          <Text style={{ fontSize: "15px", lineHeight: 1.6 }}>
            <strong>Motivo:</strong> {rejectionReason}
          </Text>
        </Section>
      ) : null}
      <Button
        href={`${appUrl}${approved ? "/perfil" : "/verificacion"}`}
        style={{
          backgroundColor: colors.teal,
          borderRadius: "8px",
          color: colors.white,
          display: "inline-block",
          fontWeight: 700,
          marginTop: "12px",
          padding: "12px 18px",
          textDecoration: "none",
        }}
      >
        {approved ? "Completar mi perfil" : "Corregir mi solicitud"}
      </Button>
    </EmailLayout>
  )
}

function StudentMessageEmail({
  recipientName,
  senderName,
  senderEmail,
  message,
}: {
  recipientName: string
  senderName: string
  senderEmail: string
  message: string
}) {
  return (
    <EmailLayout preview={`${senderName} quiere conversar contigo`}>
      <Heading
        style={{ fontSize: "28px", lineHeight: 1.2, margin: "0 0 16px" }}
      >
        Un estudiante quiere conversar contigo
      </Heading>
      <Text style={{ fontSize: "16px", lineHeight: 1.6 }}>
        Hola {recipientName}, {senderName} te escribió desde el directorio.
      </Text>
      <Section
        style={{
          backgroundColor: colors.surface,
          borderLeft: `4px solid ${colors.teal}`,
          borderRadius: "8px",
          margin: "20px 0",
          padding: "12px 20px",
        }}
      >
        <Text
          style={{ fontSize: "16px", lineHeight: 1.7, whiteSpace: "pre-wrap" }}
        >
          {message}
        </Text>
      </Section>
      <Text style={{ color: colors.muted, fontSize: "14px", lineHeight: 1.6 }}>
        Puedes responder directamente a este correo. Tu respuesta llegará a{" "}
        {senderEmail}.
      </Text>
      <Button
        href={`mailto:${senderEmail}`}
        style={{
          backgroundColor: colors.teal,
          borderRadius: "8px",
          color: colors.white,
          display: "inline-block",
          fontWeight: 700,
          marginTop: "12px",
          padding: "12px 18px",
          textDecoration: "none",
        }}
      >
        Responder a {senderName}
      </Button>
    </EmailLayout>
  )
}

function resendClient() {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM
  if (!apiKey || !from) {
    throw new Error("Falta configurar RESEND_API_KEY o RESEND_FROM")
  }
  return { resend: new Resend(apiKey), from }
}

export const sendVerificationResult = internalAction({
  args: {
    idempotencyKey: v.string(),
    email: v.string(),
    name: v.string(),
    approved: v.boolean(),
    rejectionReason: v.optional(v.string()),
  },
  returns: v.string(),
  handler: async (_ctx, args) => {
    const appUrl = process.env.APP_URL?.replace(/\/$/, "")
    if (!appUrl) throw new Error("Falta configurar APP_URL")
    const { resend, from } = resendClient()
    const { data, error } = await resend.emails.send(
      {
        from,
        to: args.email,
        subject: args.approved
          ? "Tu cuenta en Red Alumni ICC fue verificada"
          : "Resultado de tu solicitud a Red Alumni ICC",
        react: (
          <VerificationResultEmail
            name={args.name}
            approved={args.approved}
            rejectionReason={args.rejectionReason}
            appUrl={appUrl}
          />
        ),
      },
      { idempotencyKey: args.idempotencyKey }
    )
    if (error) throw new Error(`Resend rechazó el correo: ${error.message}`)
    return data.id
  },
})

export const sendStudentMessage = internalAction({
  args: {
    deliveryId: v.id("contactMessages"),
    senderName: v.string(),
    senderEmail: v.string(),
    recipientName: v.string(),
    recipientEmail: v.string(),
    message: v.string(),
  },
  returns: v.string(),
  handler: async (_ctx, args) => {
    const { resend, from } = resendClient()
    const { data, error } = await resend.emails.send(
      {
        from,
        to: args.recipientEmail,
        replyTo: args.senderEmail,
        subject: `${args.senderName} quiere conversar contigo`,
        react: <StudentMessageEmail {...args} />,
      },
      { idempotencyKey: `contact-${args.deliveryId}` }
    )
    if (error) throw new Error(`Resend rechazó el correo: ${error.message}`)
    return data.id
  },
})
