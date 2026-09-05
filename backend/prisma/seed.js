/**
 * Seed script — Urban Furniture Accounting System
 * Run: node prisma/seed.js
 *
 * Creates two demo companies, each with an ADMIN and a USER account,
 * plus default Chart of Accounts and Journals.
 * Then generates 200-300 random interrelated records per table using Faker.
 *
 * Demo credentials:
 *  - admin@urbanfurniture.com   / Password@123  (ADMIN)
 *  - designer@urbanfurniture.com / Password@123 (USER)
 *  - manager@modernteak.com     / Password@123  (ADMIN)
 *  - staff@modernteak.com       / Password@123  (USER)
 */

require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");

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

async function clearOldData() {
  console.log("🧹 Clearing old data (except companies, users, accounts, journals)...");
  // Due to foreign key constraints, clear from leaves to root
  await prisma.journalEntryLine.deleteMany();
  await prisma.orderLine.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.product.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.analyticAccount.deleteMany();
  console.log("✅ Cleared old generated data.");
}

async function generateData(company, users, accounts, journals) {
  console.log(`\nGenerating faker data for ${company.name}...`);
  // Target: ~125 records per company so total is ~250 per table
  const numRecords = 125; 
  
  // 1. Contacts
  console.log(`   - Generating ${numRecords} Contacts...`);
  const contactsData = Array.from({ length: numRecords }).map(() => ({
    name: faker.company.name(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    type: faker.helpers.arrayElement(["CUSTOMER", "VENDOR"]),
    companyId: company.id
  }));
  await prisma.contact.createMany({ data: contactsData });
  const contacts = await prisma.contact.findMany({ where: { companyId: company.id } });
  
  // 2. Products
  console.log(`   - Generating ${numRecords} Products...`);
  const productsData = Array.from({ length: numRecords }).map(() => ({
    name: faker.commerce.productName(),
    type: faker.helpers.arrayElement(["GOODS", "SERVICE", "COMBO"]),
    category: faker.commerce.department(),
    salesPrice: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
    cost: parseFloat(faker.commerce.price({ min: 1, max: 500 })),
    sku: faker.string.alphanumeric(8).toUpperCase(),
    description: faker.commerce.productDescription(),
    companyId: company.id
  }));
  await prisma.product.createMany({ data: productsData });
  const products = await prisma.product.findMany({ where: { companyId: company.id } });
  
  // 3. AnalyticAccounts
  console.log(`   - Generating 25 Analytic Accounts...`);
  const analyticData = Array.from({ length: 25 }).map(() => ({
    name: faker.finance.accountName(),
    budgetLimit: faker.number.float({ min: 1000, max: 50000 }),
    companyId: company.id
  }));
  await prisma.analyticAccount.createMany({ data: analyticData });
  const analyticAccounts = await prisma.analyticAccount.findMany({ where: { companyId: company.id } });
  
  // 4. Submissions
  console.log(`   - Generating ${numRecords} Submissions...`);
  const submissionsData = Array.from({ length: numRecords }).map(() => ({
    title: faker.lorem.sentence(3),
    description: faker.lorem.paragraph(),
    status: faker.helpers.arrayElement(["PENDING", "APPROVED", "REJECTED"]),
    ownerId: faker.helpers.arrayElement(users).id,
    companyId: company.id
  }));
  await prisma.submission.createMany({ data: submissionsData });
  
  // 5. Orders & OrderLines
  console.log(`   - Generating ${numRecords} Orders & Payments...`);
  for (let i = 0; i < numRecords; i++) {
    const contact = faker.helpers.arrayElement(contacts);
    const orderType = faker.helpers.arrayElement(["PURCHASE_ORDER", "CUSTOMER_INVOICE", "VENDOR_BILL"]);
    
    let totalAmount = 0;
    const lines = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(() => {
      const product = faker.helpers.arrayElement(products);
      const qty = faker.number.int({ min: 1, max: 10 });
      const price = orderType === "PURCHASE_ORDER" ? product.cost : product.salesPrice;
      const sub = qty * price;
      totalAmount += sub;
      
      return {
        description: product.name,
        quantity: qty,
        unitPrice: price,
        subtotal: sub,
        productId: product.id,
        accountId: faker.helpers.arrayElement(accounts).id,
        analyticAccountId: faker.helpers.arrayElement(analyticAccounts).id,
        companyId: company.id
      };
    });
    
    const orderNumber = `ORD-${faker.string.alphanumeric(8).toUpperCase()}`;
    const order = await prisma.order.create({
      data: {
        orderNumber: orderNumber,
        reference: faker.lorem.word(),
        date: faker.date.past(),
        dueDate: faker.date.future(),
        type: orderType,
        status: faker.helpers.arrayElement(["DRAFT", "CONFIRMED", "CANCELLED"]),
        totalAmount: totalAmount,
        amountDue: totalAmount,
        contactId: contact.id,
        companyId: company.id,
        lines: { create: lines }
      }
    });
    
    // Payments
    if (order.status === "CONFIRMED" && Math.random() > 0.5) {
      await prisma.payment.create({
        data: {
          paymentNumber: `PAY-${faker.string.alphanumeric(8).toUpperCase()}`,
          paymentType: orderType === "CUSTOMER_INVOICE" ? "RECEIVE" : "SEND",
          method: faker.helpers.arrayElement(["CASH", "BANK"]),
          status: "POSTED",
          amount: totalAmount,
          date: faker.date.recent(),
          contactId: contact.id,
          orderId: order.id,
          companyId: company.id
        }
      });
      await prisma.order.update({
        where: { id: order.id },
        data: { amountDue: 0, paidCash: totalAmount }
      });
    }
  }
  
  // 6. Journal Entries
  console.log(`   - Generating ${numRecords} Journal Entries...`);
  for (let i = 0; i < numRecords; i++) {
    const journal = faker.helpers.arrayElement(journals);
    const amount = faker.number.float({ min: 10, max: 5000 });
    const acc1 = faker.helpers.arrayElement(accounts);
    let acc2 = faker.helpers.arrayElement(accounts);
    while (acc2.id === acc1.id) acc2 = faker.helpers.arrayElement(accounts); // Ensure different
    
    await prisma.journalEntry.create({
      data: {
        date: faker.date.recent(),
        reference: faker.finance.transactionType(),
        status: faker.helpers.arrayElement(["DRAFT", "POSTED", "CANCELLED"]),
        journalId: journal.id,
        companyId: company.id,
        lines: {
          create: [
            {
              description: faker.lorem.words(3),
              debit: amount,
              credit: 0,
              accountId: acc1.id,
              companyId: company.id
            },
            {
              description: faker.lorem.words(3),
              debit: 0,
              credit: amount,
              accountId: acc2.id,
              companyId: company.id
            }
          ]
        }
      }
    });
  }
}

async function seedCompany(companyName, rawUsers) {
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
  let users = [];
  for (const u of rawUsers) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const upsertedUser = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, passwordHash },
      create: { name: u.name, email: u.email, passwordHash, role: u.role, companyId: company.id },
    });
    users.push(upsertedUser);
    console.log(`   👤 ${u.role.padEnd(5)} — ${u.email}  [password: ${u.password}]`);
  }

  // Retrieve Accounts & Journals for generating data
  const accounts = await prisma.account.findMany({ where: { companyId: company.id } });
  const journals = await prisma.journal.findMany({ where: { companyId: company.id } });

  await generateData(company, users, accounts, journals);
  
  return company;
}

async function main() {
  console.log("🌱  Starting seed...\n");

  await clearOldData();

  await seedCompany("Urban Furniture Co.", [
    { name: "Alex Admin",     email: "admin@urbanfurniture.com",    password: "Password@123", role: "ADMIN" },
    { name: "Dana Designer",  email: "designer@urbanfurniture.com", password: "Password@123", role: "USER"  },
  ]);

  await seedCompany("Modern Teak Ltd.", [
    { name: "Morgan Manager", email: "manager@modernteak.com", password: "Password@123", role: "ADMIN" },
    { name: "Sam Staff",      email: "staff@modernteak.com",   password: "Password@123", role: "USER"  },
  ]);

  console.log("\n✨  Seed complete!\n");
  console.log("Demo login credentials:");
  console.log("  admin@urbanfurniture.com    / Password@123  (ADMIN)");
  console.log("  designer@urbanfurniture.com / Password@123  (USER)");
  console.log("  manager@modernteak.com      / Password@123  (ADMIN)");
  console.log("  staff@modernteak.com        / Password@123  (USER)");
}

main()
  .catch((e) => {
    console.error("❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
