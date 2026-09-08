const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, company: { select: { id: true, name: true } } }
  });
  console.log('Users count:', users.length);
  console.log('Users:', users);
  const companies = await prisma.company.findMany({ select: { id: true, name: true } });
  console.log('Companies:', companies);
  for (const c of companies) {
    const contacts = await prisma.contact.count({ where: { companyId: c.id } });
    const products = await prisma.product.count({ where: { companyId: c.id } });
    const orders = await prisma.order.count({ where: { companyId: c.id } });
    console.log(`Company "${c.name}" (${c.id}): contacts=${contacts}, products=${products}, orders=${orders}`);
  }
}
main().finally(() => prisma.$disconnect());

