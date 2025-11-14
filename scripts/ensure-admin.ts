import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

(async () => {
  const prisma = new PrismaClient();
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || '';
  const email = process.env.ADMIN_EMAIL || null;
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

  if (!password || password.length < 8) {
    console.error('ADMIN_PASSWORD no está definido o es demasiado corto (min 8).');
    process.exit(1);
  }

  try {
    const hash = await bcrypt.hash(password, saltRounds);

    const existing = await prisma.user.findUnique({ where: { username } });
    let user;
    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          password: hash,
          role: 'admin',
          // no forzamos email en update para evitar conflictos de unique
        },
      });
      console.log(`Usuario actualizado: ${user.username} (id=${user.id})`);
    } else {
      user = await prisma.user.create({
        data: {
          username,
          password: hash,
          role: 'admin',
          email: email || undefined,
        },
      });
      console.log(`Usuario creado: ${user.username} (id=${user.id})`);
    }

    console.log('Listo. Ahora puedes iniciar sesión con:');
    console.log(`  usuario: ${username}`);
    console.log(`  contraseña: ${password}`);
  } catch (err) {
    console.error('Error al asegurar/crear admin:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
