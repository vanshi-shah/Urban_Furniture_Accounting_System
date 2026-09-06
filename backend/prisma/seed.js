/**
 * Seed script — Urban Furniture Accounting System
 * Run: node prisma/seed.js
 *
 * Creates two demo companies, each with ADMIN, ACCOUNTANT, and USER accounts,
 * plus default Chart of Accounts and Journals.
 * Then generates ~125 random interrelated records per company using Faker.
 *
 * Demo credentials:
 * ─── Urban Furniture Co. ─────────────────────────────────────────────────
 *  admin@urbanfurniture.com        / Password@123  (ADMIN)
 *  accountant@urbanfurniture.com   / Password@123  (ACCOUNTANT)
 *  user@urbanfurniture.com         / Password@123  (USER)
 *
 * ─── Modern Teak Ltd. ───────────────────────────────────────────────────
 *  manager@modernteak.com          / Password@123  (ADMIN)
 *  books@modernteak.com            / Password@123  (ACCOUNTANT)
 *  staff@modernteak.com            / Password@123  (USER)
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

async function clearAllData() {
  console.log("🧹 Clearing all existing data...");
  // Clear in leaf-to-root FK order
  await prisma.journalEntryLine.deleteMany();
  await prisma.orderLine.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.product.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.budgetLine.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.analyticAccount.deleteMany();
  await prisma.journal.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
  console.log("✅ All data cleared.");
}

async function generateData(company, users, accounts, journals) {
  console.log(`\n   Generating data for ${company.name}...`);

  // Split users into roles for equal submission ownership
  const adminUser       = users.find(u => u.role === "ADMIN");
  const accountantUser  = users.find(u => u.role === "ACCOUNTANT");
  const regularUser     = users.find(u => u.role === "USER");

  const NUM = 42; // ~42 records per type → ~42*3 = 126 total per company

  // ── 1. Contacts ──────────────────────────────────────────────────────────
  console.log(`      - Contacts (${NUM * 3})...`);
  const contactsData = Array.from({ length: NUM * 3 }).map(() => ({
    name:      faker.company.name(),
    email:     faker.internet.email(),
    phone:     faker.phone.number(),
    type:      faker.helpers.arrayElement(["CUSTOMER", "VENDOR"]),
    companyId: company.id,
  }));
  await prisma.contact.createMany({ data: contactsData });
  const contacts = await prisma.contact.findMany({ where: { companyId: company.id } });

  // ── 2. Products ───────────────────────────────────────────────────────────
  console.log(`      - Products (${NUM * 3})...`);
  const productsData = Array.from({ length: NUM * 3 }).map(() => ({
    name:        faker.commerce.productName(),
    type:        faker.helpers.arrayElement(["GOODS", "SERVICE", "COMBO"]),
    category:    faker.commerce.department(),
    salesPrice:  parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
    cost:        parseFloat(faker.commerce.price({ min: 1, max: 500 })),
    sku:         faker.string.alphanumeric(8).toUpperCase(),
    description: faker.commerce.productDescription(),
    companyId:   company.id,
  }));
  await prisma.product.createMany({ data: productsData });
  const products = await prisma.product.findMany({ where: { companyId: company.id } });

  // ── 3. Analytic Accounts ──────────────────────────────────────────────────
  console.log(`      - Analytic Accounts (25)...`);
  const analyticData = Array.from({ length: 25 }).map(() => ({
    name:        faker.finance.accountName(),
    budgetLimit: faker.number.float({ min: 1000, max: 50000 }),
    companyId:   company.id,
  }));
  await prisma.analyticAccount.createMany({ data: analyticData });
  const analyticAccounts = await prisma.analyticAccount.findMany({ where: { companyId: company.id } });

  // ── 4. Submissions — equally divided across 3 roles ───────────────────────
  console.log(`      - Submissions (${NUM * 3}, ~${NUM} per role)...`);
  const allUsers = [adminUser, accountantUser, regularUser];
  const submissionsData = Array.from({ length: NUM * 3 }).map((_, i) => ({
    title:       faker.lorem.sentence(3),
    description: faker.lorem.paragraph(),
    status:      faker.helpers.arrayElement(["PENDING", "APPROVED", "REJECTED"]),
    ownerId:     allUsers[i % 3].id,   // round-robin across all 3 users
    companyId:   company.id,
  }));
  await prisma.submission.createMany({ data: submissionsData });

  // ── 5. Orders & Payments — equal mix of CUSTOMER_INVOICE, VENDOR_BILL, PO ─
  console.log(`      - Orders (${NUM * 3})...`);
  const orderTypes = ["PURCHASE_ORDER", "CUSTOMER_INVOICE", "VENDOR_BILL"];

  for (let i = 0; i < NUM * 3; i++) {
    const contact   = faker.helpers.arrayElement(contacts);
    const orderType = orderTypes[i % 3]; // cycle evenly through all types
    const status    = faker.helpers.arrayElement(["DRAFT", "CONFIRMED", "CANCELLED"]);

    let totalAmount = 0;
    const lines = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(() => {
      const product = faker.helpers.arrayElement(products);
      const qty     = faker.number.int({ min: 1, max: 10 });
      const price   = orderType === "PURCHASE_ORDER" ? product.cost : product.salesPrice;
      const sub     = qty * price;
      totalAmount  += sub;
      return {
        description:      product.name,
        quantity:         qty,
        unitPrice:        price,
        subtotal:         sub,
        productId:        product.id,
        accountId:        faker.helpers.arrayElement(accounts).id,
        analyticAccountId: faker.helpers.arrayElement(analyticAccounts).id,
        companyId:        company.id,
      };
    });

    const orderNumber = `ORD-${faker.string.alphanumeric(8).toUpperCase()}`;
    const order = await prisma.order.create({
      data: {
        orderNumber,
        reference:   faker.lorem.word(),
        date:        faker.date.past(),
        dueDate:     faker.date.future(),
        type:        orderType,
        status,
        totalAmount,
        amountDue:   totalAmount,
        contactId:   contact.id,
        companyId:   company.id,
        lines:       { create: lines },
      },
    });

    // Create a payment for ~50% of CONFIRMED orders
    if (status === "CONFIRMED" && Math.random() > 0.5) {
      const payType = orderType === "CUSTOMER_INVOICE" ? "RECEIVE" : "SEND";
      await prisma.payment.create({
        data: {
          paymentNumber: `PAY-${faker.string.alphanumeric(8).toUpperCase()}`,
          paymentType:   payType,
          method:        faker.helpers.arrayElement(["CASH", "BANK"]),
          status:        "POSTED",
          amount:        totalAmount,
          date:          faker.date.recent(),
          contactId:     contact.id,
          orderId:       order.id,
          companyId:     company.id,
        },
      });
      await prisma.order.update({
        where: { id: order.id },
        data:  { amountDue: 0, paidCash: totalAmount },
      });
    }
  }

  // ── 6. Journal Entries ────────────────────────────────────────────────────
  console.log(`      - Journal Entries (${NUM * 3})...`);
  for (let i = 0; i < NUM * 3; i++) {
    const journal = faker.helpers.arrayElement(journals);
    const amount  = faker.number.float({ min: 10, max: 5000 });
    const acc1    = faker.helpers.arrayElement(accounts);
    let   acc2    = faker.helpers.arrayElement(accounts);
    while (acc2.id === acc1.id) acc2 = faker.helpers.arrayElement(accounts);

    await prisma.journalEntry.create({
      data: {
        date:      faker.date.recent(),
        reference: faker.finance.transactionType(),
        status:    faker.helpers.arrayElement(["DRAFT", "POSTED", "CANCELLED"]),
        journalId: journal.id,
        companyId: company.id,
        lines: {
          create: [
            {
              description: faker.lorem.words(3),
              debit:       amount,
              credit:      0,
              accountId:   acc1.id,
              companyId:   company.id,
            },
            {
              description: faker.lorem.words(3),
              debit:       0,
              credit:      amount,
              accountId:   acc2.id,
              companyId:   company.id,
            },
          ],
        },
      },
    });
  }

  // ── 7. Budgets ────────────────────────────────────────────────────
  console.log(`      - Budgets (15)...`);
  const allAnalyticAccounts = await prisma.analyticAccount.findMany({ where: { companyId: company.id } });
  if (allAnalyticAccounts.length > 0) {
    const statuses = ["DRAFT", "CONFIRMED", "DONE"];
    for (let i = 0; i < 15; i++) {
      const budgetLines = [];
      const numLines = faker.number.int({ min: 1, max: Math.min(3, allAnalyticAccounts.length) });
      const shuffledAAs = faker.helpers.shuffle(allAnalyticAccounts).slice(0, numLines);

      const startMonth = i % 12;
      const endMonth = (i % 12) + 2;
      const budgetStartDate = new Date(2026, startMonth, 1);
      const budgetEndDate = new Date(2026, endMonth, 0);

      const createdAAs = [];

      for (const aa of shuffledAAs) {
        const isOverdue = Math.random() > 0.5;
        const committedAmount = faker.number.float({ min: 1000, max: 200000, multipleOf: 1000 });
        const achievedAmount = isOverdue 
          ? committedAmount + faker.number.float({ min: 500, max: 10000 }) 
          : faker.number.float({ min: 0, max: committedAmount });

        budgetLines.push({
          analyticAccountId: aa.id,
          committedAmount
        });

        createdAAs.push({ aa, achievedAmount });
      }

      await prisma.budget.create({
        data: {
          name: `Budget 2026 Q${(i % 4) + 1} - ${i + 1}`,
          startDate: budgetStartDate,
          endDate: budgetEndDate,
          responsible: faker.person.fullName(),
          status: statuses[i % 3],
          companyId: company.id,
          lines: {
            create: budgetLines
          }
        }
      });

      // Create journal entries for the achieved amounts
      if (journals.length > 0 && accounts.length > 1) {
        for (const item of createdAAs) {
          if (item.achievedAmount > 0) {
            await prisma.journalEntry.create({
              data: {
                date: new Date(budgetStartDate.getTime() + (86400000 * 2)), // 2 days after start
                reference: 'Budget Expense',
                status: 'POSTED',
                journalId: journals[0].id,
                companyId: company.id,
                lines: {
                  create: [
                    {
                      description: 'Budget Expense',
                      debit: item.achievedAmount,
                      credit: 0,
                      accountId: accounts[0].id,
                      analyticAccountId: item.aa.id,
                      companyId: company.id,
                    },
                    {
                      description: 'Budget Expense Offset',
                      debit: 0,
                      credit: item.achievedAmount,
                      accountId: accounts[1].id,
                      companyId: company.id,
                    },
                  ],
                },
              },
            });
          }
        }
      }
    }
  }
}

async function seedCompany(companyName, companyId, rawUsers) {
  console.log(`\n🏢  Seeding company: ${companyName}`);

  const company = await prisma.company.create({
    data: { id: companyId, name: companyName },
  });

  // Chart of Accounts
  for (const acc of DEFAULT_ACCOUNTS) {
    await prisma.account.create({ data: { ...acc, companyId: company.id } });
  }
  console.log(`   ✅ Chart of Accounts (${DEFAULT_ACCOUNTS.length} accounts)`);

  // Journals
  for (const jnl of DEFAULT_JOURNALS) {
    await prisma.journal.create({ data: { ...jnl, companyId: company.id } });
  }
  console.log(`   ✅ Journals (${DEFAULT_JOURNALS.length} journals)`);

  // Users — ADMIN, ACCOUNTANT, USER
  const users = [];
  for (const u of rawUsers) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const created = await prisma.user.create({
      data: { name: u.name, email: u.email, passwordHash, role: u.role, companyId: company.id },
    });
    users.push(created);
    console.log(`   👤 ${u.role.padEnd(11)} — ${u.email}  [password: ${u.password}]`);
  }

  const accounts = await prisma.account.findMany({ where: { companyId: company.id } });
  const journals = await prisma.journal.findMany({ where: { companyId: company.id } });

  await generateData(company, users, accounts, journals);

  return company;
}

async function main() {
  console.log("🌱  Starting seed...\n");

  await clearAllData();

  await seedCompany("Urban Furniture Co.", "seed-urban-furniture-co", [
    { name: "Alex Admin",       email: "admin@urbanfurniture.com",      password: "Password@123", role: "ADMIN"      },
    { name: "Amy Accountant",   email: "accountant@urbanfurniture.com", password: "Password@123", role: "ACCOUNTANT" },
    { name: "Uma User",         email: "user@urbanfurniture.com",       password: "Password@123", role: "USER"       },
  ]);

  await seedCompany("Modern Teak Ltd.", "seed-modern-teak-ltd", [
    { name: "Morgan Manager",   email: "manager@modernteak.com",  password: "Password@123", role: "ADMIN"      },
    { name: "Blake Books",      email: "books@modernteak.com",    password: "Password@123", role: "ACCOUNTANT" },
    { name: "Sam Staff",        email: "staff@modernteak.com",    password: "Password@123", role: "USER"       },
  ]);

  console.log("\n✨  Seed complete!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  DEMO CREDENTIALS  (all passwords: Password@123)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Urban Furniture Co.");
  console.log("    admin@urbanfurniture.com        → ADMIN       (full access)");
  console.log("    accountant@urbanfurniture.com   → ACCOUNTANT  (accounting + master data)");
  console.log("    user@urbanfurniture.com         → USER        (own invoices only)");
  console.log("");
  console.log("  Modern Teak Ltd.");
  console.log("    manager@modernteak.com          → ADMIN       (full access)");
  console.log("    books@modernteak.com            → ACCOUNTANT  (accounting + master data)");
  console.log("    staff@modernteak.com            → USER        (own invoices only)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
