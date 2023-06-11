import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const firstName = "Aydrian";
  const lastName = "Howard";
  const email = "aydrian@gmail.com";
  const passwordHash = await bcrypt.hash("password1234", 10);

  await prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      passwordHash
    }
  });

  console.log(`Database has been seeded. 🌱`);
}

seed();
