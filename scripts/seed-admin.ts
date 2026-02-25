import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  //choose admin accout here

  const adminEmail = "admin@example.com";
  const adminPassword = "Admin123!";

  console.log("Seeding admin user...");

  //Already existing?
  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log(
      `Admin with email ${adminEmail} already exist (id= ${existing.id}).`,
    );
  }

  //Hash password with bcrypt
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  //Create user user with role ADMIN
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log("Admin created:");
  console.log(`  id: ${admin.id}`);
  console.log(`  email: ${admin.email}`);
  console.log(`  role: ${admin.role}`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
