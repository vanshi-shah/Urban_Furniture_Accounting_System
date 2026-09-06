const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const pos = await prisma.order.findMany({where: {type: 'PURCHASE_ORDER'}});
  console.log('PO Count:', pos.length);
  const others = await prisma.order.findMany();
  console.log('Total orders:', others.length);
  
  const c = await prisma.contact.findMany({where: {type: 'VENDOR'}});
  console.log('Vendors:', c.length);
}
main().finally(() => prisma.$disconnect());
