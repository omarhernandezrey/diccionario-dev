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
    let userId: number;

    if (existing) {
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          password: hash,
          role: 'admin',
          email: email || existing.email, // Actualizar email si está definido en .env
        },
      });
      userId = updated.id;
      console.log(`✅ Super Admin actualizado: ${updated.username} (id=${updated.id})`);
    } else {
      // Si no existe por username, intentamos buscar por email para evitar duplicados
      const existingEmail = email ? await prisma.user.findUnique({ where: { email } }) : null;
      
      if (existingEmail) {
         const updated = await prisma.user.update({
          where: { id: existingEmail.id },
          data: {
            username, // Forzar el username del .env
            password: hash,
            role: 'admin',
          },
        });
        userId = updated.id;
        console.log(`✅ Super Admin actualizado (encontrado por email): ${updated.username} (id=${updated.id})`);
      } else {
        const created = await prisma.user.create({
          data: {
            username,
            password: hash,
            role: 'admin',
            email: email || undefined,
          },
        });
        userId = created.id;
        console.log(`✅ Super Admin creado: ${created.username} (id=${created.id})`);
      }
    }

    // --- FASE DE LIMPIEZA: ELIMINAR COMPETENCIA ---
    // Degradar a cualquier otro usuario que tenga rol 'admin'
    const { count } = await prisma.user.updateMany({
      where: {
        role: 'admin',
        id: { not: userId }, // Todos excepto el super admin actual
      },
      data: {
        role: 'user',
      },
    });

    if (count > 0) {
      console.log(`⚠️  Se han degradado ${count} usuarios que tenían rol 'admin' injustificadamente.`);
    } else {
      console.log(`🛡️  Seguridad verificada: No existen otros administradores.`);
    }

    console.log('---------------------------------------------------');
    console.log('👑 SUPER USUARIO CONFIGURADO CORRECTAMENTE');
    console.log(`   Usuario: ${username}`);
    console.log(`   Email:   ${email || 'No definido'}`);
    console.log('---------------------------------------------------');

  } catch (err) {
    console.error('Error al asegurar/crear admin:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
