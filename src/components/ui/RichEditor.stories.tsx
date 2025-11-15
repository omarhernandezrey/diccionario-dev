import "@/app/globals.css";
import type { Story } from "@ladle/react";
import { useState } from "react";
import { RichEditor } from "./RichEditor";

const meta = {
  title: "UI/RichEditor",
};
export default meta;

export const Playground: Story = () => {
  const [value, setValue] = useState("Describe un nuevo término...");
  return (
    <div className="max-w-2xl bg-ink-900 p-6">
      <RichEditor
        label="Descripción"
        value={value}
        onChange={setValue}
        placeholder="Escribe significado, contexto y ejemplos..."
        helperText="Soporta markdown básico (negritas, listas)."
        maxLength={500}
      />
    </div>
  );
};
