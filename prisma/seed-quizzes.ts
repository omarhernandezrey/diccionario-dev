#!/usr/bin/env tsx
/**
 * Script de seed para quizzes
 * Ejecutar con: npx tsx prisma/seed-quizzes.ts
 * O añadir a package.json como script de seed
 */

import { PrismaClient, Difficulty } from "@prisma/client";

const prisma = new PrismaClient();

type SeedQuiz = {
    slug: string;
    title: string;
    description: string;
    difficulty: Difficulty;
    tags: string[];
    items: Array<{
        questionEs: string;
        questionEn: string;
        options: string[];
        answerIndex: number;
        explanationEs: string;
        explanationEn: string;
    }>;
};

const quizSeed: SeedQuiz[] = [
    {
        slug: "frontend-basics",
        title: "Fundamentos Frontend",
        description: "Repaso rápido de conceptos clave en React y CSS.",
        difficulty: Difficulty.easy,
        tags: ["frontend", "react", "css"],
        items: [
            {
                questionEs: "¿Qué hace el hook useMemo?",
                questionEn: "What does the useMemo hook do?",
                options: [
                    "Memoriza un valor derivado para evitar cálculos costosos",
                    "Dispara efectos secundarios al montar",
                    "Actualiza refs sincronamente",
                ],
                answerIndex: 0,
                explanationEs: "useMemo memoriza operaciones pesadas basadas en dependencias.",
                explanationEn: "useMemo caches expensive computations based on dependencies.",
            },
            {
                questionEs: "¿Qué valor retorna grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))?",
                questionEn: "What does grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)) achieve?",
                options: [
                    "Columnas fijas de 240px",
                    "Columnas fluidas que se adaptan al ancho disponible",
                    "Oculta columnas cuando no hay espacio",
                ],
                answerIndex: 1,
                explanationEs: "repeat auto-fit crea columnas que crecen hasta 1fr manteniendo 240px mínimos.",
                explanationEn: "auto-fit with minmax creates fluid columns that grow up to 1fr keeping 240px as the floor.",
            },
            {
                questionEs: "¿Cuál es la diferencia entre estado local y global en React?",
                questionEn: "What's the difference between local and global state in React?",
                options: [
                    "Ninguna, ambos viven en useState",
                    "El local pertenece al componente y el global se comparte vía context/store",
                    "El global sólo se puede mutar con Redux",
                ],
                answerIndex: 1,
                explanationEs: "El estado local vive en un componente, el global se comparte con context o stores externos.",
                explanationEn: "Local state belongs to a component, global state is shared via context or state libraries.",
            },
        ],
    },
    {
        slug: "api-design",
        title: "Diseño de APIs",
        description: "Escenarios sobre seguridad y contratos en APIs modernas.",
        difficulty: Difficulty.medium,
        tags: ["backend", "api", "security"],
        items: [
            {
                questionEs: "¿Qué ventaja aporta GraphQL frente a REST en clientes móviles?",
                questionEn: "Which benefit does GraphQL bring to mobile clients versus REST?",
                options: [
                    "Menos roundtrips al servidor con queries a medida",
                    "Reemplaza OAuth2 en autenticación",
                    "Evita el versionado de APIs",
                ],
                answerIndex: 0,
                explanationEs: "GraphQL permite pedir exactamente los campos necesarios, reduciendo peticiones y payload.",
                explanationEn: "GraphQL lets clients ask for exact fields, lowering payloads and roundtrips.",
            },
            {
                questionEs: "¿Cómo proteges endpoints críticos en REST?",
                questionEn: "How do you protect critical REST endpoints?",
                options: [
                    "Solo con CORS",
                    "Aplicando auth, rate limiting y validación de entradas",
                    "Con logs en consola",
                ],
                answerIndex: 1,
                explanationEs: "Seguridad básica implica autenticación, rate limiting y sanitizar inputs antes de procesar.",
                explanationEn: "Baseline security means auth, rate limiting and sanitizing inputs before processing.",
            },
            {
                questionEs: "¿Qué HTTP status usarías para un payload inválido?",
                questionEn: "Which HTTP status fits an invalid payload?",
                options: ["200 OK", "400 Bad Request", "302 Found"],
                answerIndex: 1,
                explanationEs: "400 indica que el cliente envió datos incorrectos o incompletos.",
                explanationEn: "400 signals the client sent malformed or incomplete data.",
            },
        ],
    },
    {
        slug: "database-basics",
        title: "Fundamentos de Bases de Datos",
        description: "Consultas SQL y consistencia de datos.",
        difficulty: Difficulty.medium,
        tags: ["database", "sql"],
        items: [
            {
                questionEs: "¿Qué hace un índice en una columna?",
                questionEn: "What does an index on a column do?",
                options: [
                    "Garantiza unicidad siempre",
                    "Acelera búsquedas a costa de escrituras",
                    "Impide borrados",
                ],
                answerIndex: 1,
                explanationEs: "Los índices aceleran consultas de lectura, pero añaden costo al escribir/actualizar.",
                explanationEn: "Indexes speed up reads while adding overhead to writes/updates.",
            },
            {
                questionEs: "¿Qué significa ACID?",
                questionEn: "What does ACID stand for?",
                options: [
                    "Atomicidad, Consistencia, Aislamiento, Durabilidad",
                    "Alta Concurrencia e Integridad de Datos",
                    "Async, Cache, Isolation, Data",
                ],
                answerIndex: 0,
                explanationEs: "ACID resume garantías de transacciones fiables en bases de datos.",
                explanationEn: "ACID summarizes reliable transaction guarantees in databases.",
            },
        ],
    },
];

async function main() {
    console.log("🌱 Iniciando seed de quizzes...");

    try {
        const existing = await prisma.quizTemplate.count();

        if (existing > 0) {
            console.log(`✅ Ya existen ${existing} quizzes en la base de datos. Saltando seed.`);
            return;
        }

        console.log("📝 Creando quizzes de ejemplo...");

        for (const quiz of quizSeed) {
            await prisma.quizTemplate.create({
                data: {
                    slug: quiz.slug,
                    title: quiz.title,
                    description: quiz.description,
                    difficulty: quiz.difficulty,
                    tags: quiz.tags,
                    items: quiz.items,
                },
            });
            console.log(`  ✓ Creado: ${quiz.title}`);
        }

        console.log(`\n✅ Seed completado: ${quizSeed.length} quizzes creados`);
    } catch (error) {
        console.error("❌ Error durante el seed de quizzes:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
