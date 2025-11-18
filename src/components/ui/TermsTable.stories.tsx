import "@/app/globals.css";
import type { Story } from "@ladle/react";
import { useState } from "react";
import { TermsTable } from "./TermsTable";
import type { TermDTO } from "@/types/term";

const sampleTerms: TermDTO[] = [
  {
    id: 1,
    term: "CSS Grid",
    translation: "Rejilla CSS",
    aliases: [],
    tags: ["layout", "css"],
    category: "frontend",
    meaning: "Sistema bidimensional para componer layouts.",
    what: "Distribuye columnas y filas mediante grid-template.",
    how: "Define contenedores grid y asigna áreas.",
    examples: [],
    status: "approved",
  },
  {
    id: 2,
    term: "WebSocket",
    translation: "Socket Web",
    aliases: [],
    tags: ["real-time", "network"],
    category: "backend",
    meaning: "Protocolo full-duplex sobre TCP.",
    what: "Mantiene una conexión persistente cliente-servidor.",
    how: "Negocia handshake y envía frames.",
    examples: [],
    status: "approved",
  },
  {
    id: 3,
    term: "Monorepo",
    translation: "",
    aliases: ["mono repo"],
    tags: ["tooling"],
    category: "general",
    meaning: "Estructura que contiene múltiples proyectos.",
    what: "Comparte dependencias y herramientas.",
    how: "Usa workspaces (npm, pnpm, Turborepo).",
    examples: [],
    status: "approved",
  },
];

const meta = {
  title: "UI/TermsTable",
};
export default meta;

export const DefaultView: Story = () => {
  const [lastSelected, setLastSelected] = useState<string | null>(null);
  return (
    <div className="space-y-4 bg-ink-900 p-6 text-white">
      <TermsTable terms={sampleTerms} onSelect={(term) => setLastSelected(term.term)} />
      <p className="text-sm text-white/70">Último seleccionado: {lastSelected ?? "ninguno"}</p>
    </div>
  );
};

export const Dense: Story = () => (
  <div className="bg-ink-900 p-6 text-white">
    <TermsTable terms={sampleTerms} dense />
  </div>
);
