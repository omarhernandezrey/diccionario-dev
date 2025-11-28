import useSWR from 'swr';
import type { QuizTemplateDTO, QuizAttemptDTO } from '@/types/quiz';

type QuizzesResponse = {
    ok: boolean;
    items: QuizTemplateDTO[];
};

type AttemptsResponse = {
    ok: boolean;
    items: QuizAttemptDTO[];
};

type UseQuizzesOptions = {
    tags?: string[];
    limit?: number;
    enabled?: boolean;
};

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
};

export function useQuizzes(options: UseQuizzesOptions = {}) {
    const { tags = [], limit = 10, enabled = true } = options;

    // Construir URL con parámetros
    const params = new URLSearchParams();
    if (tags.length) params.set('tags', tags.join(','));
    if (limit) params.set('limit', String(limit));

    const url = `/api/quizzes?${params.toString()}`;

    const { data, error, isLoading, mutate } = useSWR<QuizzesResponse>(
        enabled ? url : null,
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
        }
    );

    return {
        quizzes: data?.items ?? [],
        isLoading,
        error: error?.message,
        refresh: mutate,
    };
}

export function useQuizAttempts(limit = 5) {
    const url = `/api/quizzes/attempts?limit=${limit}`;

    const { data, error, isLoading, mutate } = useSWR<AttemptsResponse>(
        url,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 3000,
        }
    );

    return {
        attempts: data?.items ?? [],
        isLoading,
        error: error?.message,
        refresh: mutate,
    };
}

export function useQuizSubmit() {
    const submitAttempt = async (templateId: number, userAnswers: (number | null)[]) => {
        const res = await fetch('/api/quizzes/attempts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ templateId, userAnswers }),
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ error: 'Error desconocido' }));
            throw new Error(error.error || 'No se pudo enviar el intento');
        }

        return res.json();
    };

    return { submitAttempt };
}
