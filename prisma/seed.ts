import "dotenv/config"
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('admin1234', 10)

  const admin = await prisma.user.upsert({
    where: { username: 'username' },
    update: {},
    create: {
      username: 'username',
      password: adminPassword,
      role: 'ADMIN',
      name: 'System Admin',
    },
  })

  // Add default settings since admin is created
  const settingsCount = await prisma.settings.count()
  if (settingsCount === 0) {
    await prisma.settings.create({
      data: {
        adminWhatsapp: '+94700000000', // Example placeholder number
      }
    })
  }

  console.log({ admin })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
