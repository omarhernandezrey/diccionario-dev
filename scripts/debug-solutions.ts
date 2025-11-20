import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const term = await prisma.term.findFirst({
        where: { slug: "fetch" },
        include: { exercises: true }
    });
    if (term && term.exercises.length > 0) {
        console.log("Solutions type:", typeof term.exercises[0].solutions);
        console.log("Solutions value:", JSON.stringify(term.exercises[0].solutions, null, 2));
    } else {
        console.log("No exercises found for fetch");
    }
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
