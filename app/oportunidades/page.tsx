import type { Metadata } from "next"
import { JobBoard } from "@/components/jobs/job-board"

export const metadata: Metadata = {
  title: "Oportunidades",
  description: "Empleos y prácticas compartidos por la comunidad.",
}

export default function OportunidadesPage() {
  return <JobBoard />
}
