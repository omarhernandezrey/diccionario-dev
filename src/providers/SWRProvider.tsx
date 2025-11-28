'use client';

import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';

type ProvidersProps = {
    children: ReactNode;
};

export function SWRProvider({ children }: ProvidersProps) {
    return (
        <SWRConfig
            value={{
                // No auto-refresh por defecto
                refreshInterval: 0,

                // No revalidar al enfocar la ventana
                revalidateOnFocus: false,

                // Revalidar al reconectar internet
                revalidateOnReconnect: true,

                // Deduplicar requests en 2 segundos
                dedupingInterval: 2000,

                // Reintentar 3 veces en caso de error
                errorRetryCount: 3,

                // Esperar 1 segundo entre reintentos
                errorRetryInterval: 1000,

                // Mantener datos previos mientras se revalida
                keepPreviousData: true,

                // Fetcher por defecto
                fetcher: async (url: string) => {
                    const res = await fetch(url);
                    if (!res.ok) {
                        const error = new Error('Error en la petición');
                        throw error;
                    }
                    return res.json();
                },
            }}
        >
            {children}
        </SWRConfig>
    );
}
