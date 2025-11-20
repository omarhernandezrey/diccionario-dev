import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const exercises = await prisma.exercise.findMany();

    for (const ex of exercises) {
        const sol = ex.solutions as any;
        // Check if it matches the incorrect structure { create: ... }
        if (sol && !Array.isArray(sol) && sol.create) {
            console.log(`Fixing exercise ${ex.id} (${ex.titleEs})...`);
            const fixedSolutions = [sol.create]; // Convert { create: {...} } to [{...}]

            await prisma.exercise.update({
                where: { id: ex.id },
                data: { solutions: fixedSolutions }
            });
        }
    }
    console.log("Done fixing solutions.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
