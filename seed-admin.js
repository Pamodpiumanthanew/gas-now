const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin1234', 10);
  await prisma.user.upsert({
    where: { username: 'username' },
    update: {},
    create: {
      username: 'username',
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Super Admin'
    }
  });
  console.log('Admin user seeded in Supabase');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
