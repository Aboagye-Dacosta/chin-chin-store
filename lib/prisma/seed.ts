import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("superadmin123", 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@admin.com",
      password: passwordHash,
      role: "SUPER_ADMIN",
      profile: {
        create: {
          phoneNumber: "+233000000000",
          address: "Admin Street, Accra",
          bio: "Platform administrator",
          imageUrl: "",
        },
      },
    },
  });

  const categories = await prisma.category.createMany({
    data: [{ name: "Cinnamon" }, { name: "Coconut" }, { name: "Chocolate" }],
  });

  const location = await prisma.location.create({
    data: {
      name: "Accra",
    },
  });

  const store = await prisma.store.upsert({
    where: { name: "Awesome Store" },
    update: {},
    create: {
      name: "Awesome Store",
      locationId: location.id,
    },
  });

  const vendor = await prisma.user.upsert({
    where: { email: "vendor@vendor.com" },
    update: {},
    create: {
      name: "Vendor",
      email: "vendor@vendor.com",
      password: passwordHash,
      role: "VENDOR",
      profile: {
        create: {
          phoneNumber: "+233000000000",
          address: "Vendor Street, Accra",
          bio: "Vendor of awesome chips",
          imageUrl: "",
        },
      },
      store: {
        connect: {
          id: store.id,
        },
      },
    },
  });

  const deliveryFee = await prisma.deliveryCharge.upsert({
    where: { id: "delivery-fee" },
    update: {},
    create: {
      id: "delivery-fee",
      amount: 1,
      storeId: store.id,
    },
  });

  const paymentGatewaySettings = await prisma.paymentGatewaySettings.upsert({
    where: { id: "payment-gateway-settings" },
    update: {},
    create: {
      name: "Payment Gateway",
      environment: "TEST",
      apiKey: "sandbox-api-key",
      apiSecret: "sandbox-api-secret",
      webhookSecret: "sandbox-webhook-secret",
      supportedMethods: ["MOBILE_MONEY"],
      supportedNetworks: ["MTN", "AIRTELTIGO", "TELECEL"],
    },
  });

  console.log("✅ Seeding complete");
  console.log("👤 Super Admin:", superAdmin.email);
  console.log("🏬 Store:", store.name);
  console.log("📦 Categories:", categories);
  console.log("🚚 Delivery Fee:", deliveryFee.amount);
  console.log("👤 Vendor:", vendor.email);
  console.log("💰 Payment Gateway Settings:", paymentGatewaySettings.name);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
