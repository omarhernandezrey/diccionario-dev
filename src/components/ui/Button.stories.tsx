import "@/app/globals.css";
import type { Story } from "@ladle/react";
import { Button } from "./Button";

export default {
  title: "UI/Button",
};

export const Variants: Story = () => (
  <div className="flex flex-wrap gap-3 bg-ink-900 p-6 text-white">
    <Button variant="solid">Primario</Button>
    <Button variant="soft">Suave</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="solid" disabled>
      Disabled
    </Button>
  </div>
);

export const Sizes: Story = () => (
  <div className="flex flex-col gap-3 bg-ink-900 p-6 text-white">
    <Button size="sm">Pequeño</Button>
    <Button size="md">Mediano</Button>
    <Button size="lg">Grande</Button>
  </div>
);

export const FullWidth: Story = () => (
  <div className="w-96 bg-ink-900 p-6 text-white">
    <Button fullWidth variant="solid">
      CTA Principal
    </Button>
  </div>
);
