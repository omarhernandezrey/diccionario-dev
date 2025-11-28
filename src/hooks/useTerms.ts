import useSWR from 'swr';
import type { TermDTO } from '@/types/term';

type TermsResponse = {
    ok: boolean;
    items: TermDTO[];
    meta: {
        total: number;
        pageSize: number;
        hasMore: boolean;
    };
};

type UseTermsOptions = {
    query?: string;
    category?: string;
    pageSize?: number;
    sort?: string;
    enabled?: boolean;
};

const fetcher = async (url: string): Promise<TermsResponse> => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
};

const singleTermFetcher = async (url: string): Promise<{ ok: boolean; item: TermDTO }> => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
};

export function useTerms(options: UseTermsOptions = {}) {
    const {
        query = '',
        category,
        pageSize = 10,
        sort = 'recent',
        enabled = true,
    } = options;

    // Construir URL con parámetros
    const params = new URLSearchParams();
    params.set('pageSize', String(pageSize));
    params.set('sort', sort);
    if (query) params.set('q', query);
    if (category) params.set('category', category);

    const url = `/api/terms?${params.toString()}`;

    const { data, error, isLoading, mutate } = useSWR<TermsResponse>(
        enabled ? url : null,
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 2000, // Evitar requests duplicados en 2s
            errorRetryCount: 3,
            errorRetryInterval: 1000,
        }
    );

    return {
        terms: data?.items ?? [],
        meta: data?.meta,
        isLoading,
        error: error?.message,
        refresh: mutate,
    };
}

export function useTerm(termId: number | null) {
    const url = termId ? `/api/terms/${termId}` : null;

    const { data, error, isLoading, mutate } = useSWR<{ ok: boolean; item: TermDTO }>(
        url,
        singleTermFetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 5000,
        }
    );

    return {
        term: data?.item ?? null,
        isLoading,
        error: error?.message,
        refresh: mutate,
    };
}
