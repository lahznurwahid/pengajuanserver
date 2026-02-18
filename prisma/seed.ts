import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password", 10);

  const users = [
    {
      nama: "Admin Server",
      email: "admin@demo.com",
      role: Role.ADMIN_SERVER,
    },
    {
      nama: "Demo Staff",
      email: "staff@demo.com",
      role: Role.STAF,
    },
    {
      nama: "Demo Pemohon",
      email: "pemohon@demo.com",
      role: Role.PEMOHON,
    },
    {
      nama: "Demo Kepala Lab",
      email: "kepalalab@demo.com",
      role: Role.KEPALA_LAB,
    },
    {
      nama: "Demo Wakil Dekan",
      email: "wadek@demo.com",
      role: Role.WADEK,
    },
    {
      nama: "Dekan",
      email: "dekan@demo.com",
      role: Role.DEKAN,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {}, // tidak update kalau sudah ada
      create: {
        ...user,
        password,
      },
    });
  }

  console.log("✅ Demo users ready (idempotent)");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
