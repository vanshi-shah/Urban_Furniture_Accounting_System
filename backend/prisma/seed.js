/**
 * Seed script — Urban Furniture Accounting System
 * Run: node prisma/seed.js
 *
 * Creates two demo companies, each with an ADMIN and a USER account,
 * plus default Chart of Accounts and Journals.
 *
 * Demo credentials:
 *  - admin@urbanfurniture.com   / password123  (ADMIN)
 *  - designer@urbanfurniture.com / password123 (USER)
 *  - manager@modernteak.com     / password123  (ADMIN)
 *  - staff@modernteak.com       / password123  (USER)
 */

require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const DEFAULT_ACCOUNTS = [
  { code: "1000", name: "Cash on Hand",        type: "ASSET" },
  { code: "1010", name: "Bank Account",         type: "ASSET" },
  { code: "1200", name: "Accounts Receivable",  type: "ASSET" },
  { code: "1500", name: "Inventory",            type: "ASSET" },
  { code: "2100", name: "Accounts Payable",     type: "LIABILITY" },
  { code: "2500", name: "Short-term Loans",     type: "LIABILITY" },
  { code: "3000", name: "Owner's Equity",       type: "EQUITY" },
  { code: "3100", name: "Retained Earnings",    type: "EQUITY" },
  { code: "4000", name: "Sales Revenue",        type: "INCOME" },
  { code: "4100", name: "Service Revenue",      type: "INCOME" },
  { code: "5000", name: "Cost of Goods Sold",   type: "EXPENSE" },
  { code: "5100", name: "Salaries Expense",     type: "EXPENSE" },
  { code: "5200", name: "Rent Expense",         type: "EXPENSE" },
  { code: "5300", name: "Utilities Expense",    type: "EXPENSE" },
];

const DEFAULT_JOURNALS = [
  { code: "CSH", name: "Cash Journal",        type: "CASH" },
  { code: "BNK", name: "Bank Journal",        type: "BANK" },
  { code: "SAL", name: "Sales Journal",       type: "SALES" },
  { code: "PUR", name: "Purchases Journal",   type: "PURCHASES" },
  { code: "GEN", name: "General Operations",  type: "GENERAL" },
];

async function seedCompany(companyName, users) {
  console.log(`\n🏢  Seeding company: ${companyName}`);

  // Upsert company
  const company = await prisma.company.upsert({
    where: { id: `seed-${companyName.toLowerCase().replace(/\s+/g, "-")}` },
    update: { name: companyName },
    create: { id: `seed-${companyName.toLowerCase().replace(/\s+/g, "-")}`, name: companyName },
  });

  // Seed Chart of Accounts
  for (const acc of DEFAULT_ACCOUNTS) {
    await prisma.account.upsert({
      where: { code_companyId: { code: acc.code, companyId: company.id } },
      update: {},
      create: { ...acc, companyId: company.id },
    });
  }
  console.log(`   ✅ Chart of Accounts seeded (${DEFAULT_ACCOUNTS.length} accounts)`);

  // Seed Journals
  for (const jnl of DEFAULT_JOURNALS) {
    await prisma.journal.upsert({
      where: { code_companyId: { code: jnl.code, companyId: company.id } },
      update: {},
      create: { ...jnl, companyId: company.id },
    });
  }
  console.log(`   ✅ Journals seeded (${DEFAULT_JOURNALS.length} journals)`);

  // Seed Users
  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, passwordHash },
      create: { name: u.name, email: u.email, passwordHash, role: u.role, companyId: company.id },
    });
    console.log(`   👤 ${u.role.padEnd(5)} — ${u.email}  [password: ${u.password}]`);
  }

  return company;
}

async function main() {
  console.log("🌱  Starting seed...\n");

  await seedCompany("Urban Furniture Co.", [
    { name: "Alex Admin",     email: "admin@urbanfurniture.com",    password: "password123", role: "ADMIN" },
    { name: "Dana Designer",  email: "designer@urbanfurniture.com", password: "password123", role: "USER"  },
  ]);

  await seedCompany("Modern Teak Ltd.", [
    { name: "Morgan Manager", email: "manager@modernteak.com", password: "password123", role: "ADMIN" },
    { name: "Sam Staff",      email: "staff@modernteak.com",   password: "password123", role: "USER"  },
  ]);

  console.log("\n✨  Seed complete!\n");
  console.log("Demo login credentials:");
  console.log("  admin@urbanfurniture.com    / password123  (ADMIN)");
  console.log("  designer@urbanfurniture.com / password123  (USER)");
  console.log("  manager@modernteak.com      / password123  (ADMIN)");
  console.log("  staff@modernteak.com        / password123  (USER)");
}

main()
  .catch((e) => {
    console.error("❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
