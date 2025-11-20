import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const term = await prisma.term.findFirst({
        where: { slug: "fetch" },
        include: { exercises: true }
    });

    console.log(JSON.stringify(term?.exercises, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
