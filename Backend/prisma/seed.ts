import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Limpiamos los productos de prueba anteriores (ya no habrá productos hardcodeados)
  await prisma.producto.deleteMany();

  // Creamos tu cuenta de Administrador personalizada
  const emailAdmin = 'Aziel@admin';
  const adminExistente = await prisma.user.findUnique({
    where: { email: emailAdmin },
  });

  if (!adminExistente) {
    const hashedPassword = await bcrypt.hash('Kabnia', 10);
    await prisma.user.create({
      data: {
        name: 'Aziel',
        email: emailAdmin,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('✅ ¡Usuario Administrador (Aziel) creado con éxito!');
  } else {
    // Si ya existía con otro correo o ya fue creado, actualizamos sus credenciales por si acaso
    const hashedPassword = await bcrypt.hash('Kabnia', 10);
    await prisma.user.update({
      where: { email: emailAdmin },
      data: {
        name: 'Aziel',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('ℹ️ El usuario administrador Aziel ya existía, se han actualizado sus credenciales.');
  }

  console.log('🌱 Seed ejecutado correctamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });