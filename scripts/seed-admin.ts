import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";

  let adminPassword = process.env.ADMIN_PASSWORD;
  let passwordWasGenerated = false;
  if (!adminPassword) {
    adminPassword = crypto.randomBytes(16).toString("hex");
    passwordWasGenerated = true;
  }

  console.log("Seeding admin user...");
  console.log(`  Using email: ${adminEmail}`);

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
  if (passwordWasGenerated) {
    console.log(`  password (generated): ${adminPassword}`);
    console.log("  ⚠  Save this password now — it will not be shown again.");
  }
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
