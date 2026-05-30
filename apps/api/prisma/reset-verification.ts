/**
 * One-time maintenance: reset faked verification state to honest "unverified".
 *
 *   pnpm --filter @hub/api db:reset-verification
 *
 * Earlier imports stamped freshnessScore/lastVerifiedAt/freeTierReal as if the
 * tools had been machine-checked. They had not. This wipes those claims back to
 * the unverified baseline so the verification engine can EARN real values on its
 * next pass. Safe to run repeatedly; it only clears verification fields and never
 * touches catalog metadata (name, url, pricingModel, hasApi, isOpenSource).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const res = await prisma.tool.updateMany({
    data: {
      freshnessScore: 0,
      lastVerifiedAt: null,
      freeTierReal: false,
    },
  });
  console.log(`Reset verification state on ${res.count} tools. Run the engine to re-earn values.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
