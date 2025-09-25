import { faker } from "@faker-js/faker";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../schema";
import { GlobalRole } from "../lib/super-user";

// Use Docker connection string directly
const connectionString =
  "postgresql://songcraft:songcraft_dev_password@localhost:5433/songcraft_dev";
const client = postgres(connectionString);
const db = drizzle(client);

async function seedUsers() {
  console.log("🌱 Starting to seed 500 users...");

  const userData = [];
  const roles = [
    GlobalRole.USER,
    GlobalRole.SUPPORT,
    GlobalRole.ADMIN,
    GlobalRole.SUPER_ADMIN,
  ];

  // Role distribution: 90% users, 5% support, 4% admin, 1% super_admin
  const roleWeights = [0.9, 0.05, 0.04, 0.01];

  for (let i = 0; i < 500; i++) {
    // Generate random role based on weights
    const random = Math.random();
    let roleIndex = 0;
    let cumulativeWeight = 0;

    for (let j = 0; j < roleWeights.length; j++) {
      cumulativeWeight += roleWeights[j];
      if (random <= cumulativeWeight) {
        roleIndex = j;
        break;
      }
    }

    const user = {
      id: faker.string.uuid(),
      clerkId: `clerk_${faker.string.alphanumeric(20)}`,
      email: faker.internet.email(),
      globalRole: roles[roleIndex],
      createdAt: faker.date.between({
        from: new Date("2024-01-01"),
        to: new Date(),
      }),
      lastLoginAt: faker.datatype.boolean(0.7)
        ? faker.date.recent({ days: 30 })
        : null,
    };

    userData.push(user);
  }

  try {
    // Insert users in batches of 100 for better performance
    const batchSize = 100;
    for (let i = 0; i < userData.length; i += batchSize) {
      const batch = userData.slice(i, i + batchSize);
      await db.insert(users).values(batch);
      console.log(
        `✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(userData.length / batchSize)}`
      );
    }

    console.log("🎉 Successfully seeded 500 users!");

    // Show role distribution
    const roleCounts = userData.reduce(
      (acc, user) => {
        acc[user.globalRole] = (acc[user.globalRole] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log("📊 Role distribution:");
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`  ${role}: ${count} users`);
    });
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error;
  }
}

// Run the seeder
if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log("✨ Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}

export { seedUsers };
