import type { TermDTO } from "@/types/term";
import { cn } from "@/lib/cn";

export type TermsTableProps = {
  terms: TermDTO[];
  dense?: boolean;
  onSelect?: (term: TermDTO) => void;
};

export function TermsTable({ terms, dense = false, onSelect }: TermsTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-ink-900/50">
      <table className={cn("min-w-full divide-y divide-white/10 text-sm text-white", dense && "text-xs")}>
        <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/60">
          <tr>
            <th className="px-4 py-3 text-left">Término</th>
            <th className="px-4 py-3 text-left">Categoría</th>
            <th className="px-4 py-3 text-left">Tags</th>
            <th className="px-4 py-3 text-left">Traducción</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {terms.map((term) => (
            <tr key={term.id} className="hover:bg-white/5">
              <td className="px-4 py-3 font-semibold">{term.term}</td>
              <td className="px-4 py-3 capitalize text-white/80">{term.category}</td>
              <td className="px-4 py-3 text-white/70">{term.tags?.length ? term.tags.join(", ") : "—"}</td>
              <td className="px-4 py-3 text-white/80">{term.translation || "—"}</td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  className="rounded-full border border-accent-secondary/40 px-3 py-1 text-xs font-semibold text-accent-secondary transition hover:bg-accent-secondary/10"
                  onClick={() => onSelect?.(term)}
                >
                  Ver detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!terms.length && <p className="p-6 text-center text-sm text-white/60">No hay términos.</p>}
    </div>
  );
}
