import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  const term = await prisma.term.findUnique({ where: { id: 1 } });
  console.log('fetch term in BD:');
  console.log('- meaning:', term?.meaning?.substring(0, 60));
  console.log('- what:', term?.what?.substring(0, 60));
  console.log('- how:', term?.how?.substring(0, 60));
  console.log('- examples length:', Array.isArray(term?.examples) ? term.examples.length : 'not array');
  await prisma.$disconnect();
})();
