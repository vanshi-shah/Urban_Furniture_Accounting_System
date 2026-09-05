require('dotenv').config();
const app = require('./app');
const prisma = require('./lib/prisma');

const PORT = process.env.PORT || 4000;

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to database');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to database', err);
    process.exit(1);
  }
}

main();
