"use client";

import { useState } from 'react';
import { useTerms } from '@/hooks/useTerms';
import { Icon } from '@/components/Icon';

/**
 * Ejemplo de migración del admin para usar useTerms con SWR
 * 
 * ANTES (fetch manual):
 * - useEffect con fetch
 * - useState para loading, error, data
 * - Manejo manual de estados
 * 
 * DESPUÉS (con SWR):
 * - Hook useTerms
 * - Cache automático
 * - Revalidación inteligente
 */
export function AdminTermsListWithSWR() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>();

    // Hook con SWR - reemplaza todo el fetch manual
    const { terms, meta, isLoading, error, refresh } = useTerms({
        query: searchQuery,
        category: selectedCategory,
        pageSize: 10,
        sort: 'recent',
    });

    return (
        <div className="space-y-4">
            {/* Barra de búsqueda */}
            <div className="flex gap-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar términos..."
                    className="flex-1 rounded-lg border border-neo-border bg-neo-bg px-4 py-2 text-neo-text-primary"
                />

                <select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value || undefined)}
                    className="rounded-lg border border-neo-border bg-neo-bg px-4 py-2 text-neo-text-primary"
                >
                    <option value="">Todas</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="devops">DevOps</option>
                </select>

                <button
                    onClick={() => refresh()}
                    className="btn-ghost"
                    disabled={isLoading}
                >
                    <Icon
                        library="lucide"
                        name="RefreshCw"
                        className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                    />
                </button>
            </div>

            {/* Estado de carga */}
            {isLoading && (
                <div className="flex items-center gap-2 text-neo-text-secondary">
                    <Icon library="lucide" name="Loader2" className="h-4 w-4 animate-spin" />
                    Cargando términos...
                </div>
            )}

            {/* Estado de error */}
            {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                    <div className="flex items-center gap-2 text-red-500">
                        <Icon library="lucide" name="AlertCircle" className="h-5 w-5" />
                        <p className="font-semibold">Error al cargar términos</p>
                    </div>
                    <p className="mt-1 text-sm text-red-400">{error}</p>
                    <button onClick={() => refresh()} className="mt-2 btn-ghost text-sm">
                        <Icon library="lucide" name="RefreshCw" className="h-4 w-4 mr-2" />
                        Reintentar
                    </button>
                </div>
            )}

            {/* Lista de términos */}
            {!isLoading && !error && (
                <>
                    <div className="text-sm text-neo-text-secondary">
                        {meta && `${meta.total} términos encontrados (mostrando ${terms.length})`}
                    </div>

                    <div className="space-y-2">
                        {terms.map((term) => (
                            <div
                                key={term.id}
                                className="rounded-lg border border-neo-border bg-neo-card p-4 hover:border-neo-primary transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-neo-text-primary">{term.term}</h3>
                                        <p className="text-sm text-neo-text-secondary">{term.translation}</p>
                                    </div>
                                    <span className="rounded-full bg-neo-surface px-2 py-1 text-xs text-neo-text-secondary">
                                        {term.category}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Estado vacío */}
                    {terms.length === 0 && (
                        <div className="flex flex-col items-center gap-2 py-8 text-center text-neo-text-secondary">
                            <Icon library="lucide" name="Inbox" className="h-8 w-8" />
                            <p>No se encontraron términos</p>
                            <p className="text-xs">Intenta ajustar los filtros de búsqueda</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

/**
 * GUÍA DE MIGRACIÓN PARA admin/page.tsx:
 * 
 * 1. Importar el hook:
 *    import { useTerms } from '@/hooks/useTerms';
 * 
 * 2. Reemplazar el useEffect de fetchTerms con:
 *    const { terms, meta, isLoading, error, refresh } = useTerms({
 *      query: searchQuery,
 *      pageSize: 10,
 *    });
 * 
 * 3. Eliminar:
 *    - useState para items, itemsLoading, itemsError
 *    - useEffect con fetch manual
 *    - Función fetchTerms
 * 
 * 4. Actualizar referencias:
 *    - items → terms
 *    - itemsLoading → isLoading
 *    - itemsError → error
 *    - fetchTerms() → refresh()
 * 
 * 5. Beneficios inmediatos:
 *    - Cache automático
 *    - Deduplicación de requests
 *    - Revalidación en segundo plano
 *    - Menos código
 */
