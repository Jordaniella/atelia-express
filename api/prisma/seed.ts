import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run the seed');
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@atelia.ai' },
    update: {},
    create: {
      email: 'demo@atelia.ai',
      name: 'AtelIA Demo User',
      passwordHash,
      projects: {
        create: {
          name: 'Demo Launch Project',
          description: 'Example MVP launch project seeded for local testing.',
          status: 'DRAFT',
          brief: {
            create: {
              targetAudience: 'Indie hackers and small SaaS founders',
              brandTone: 'Clear, premium, energetic',
              launchGoal: 'Validate demand and collect first customers',
              keyMessage: 'Launch faster with AI-assisted marketing assets',
            },
          },
          products: {
            create: {
              name: 'AtelIA Launch Kit',
              description: 'A guided AI workspace for preparing product launches.',
              price: '$49/month',
              targetSegment: 'Early-stage SaaS teams',
              uniqueValueProposition: 'All launch assets generated from a single marketing brief.',
            },
          },
        },
      },
    },
  });

  console.log(`Seed complete. Demo user: ${user.email} / Password123!`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
