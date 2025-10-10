import { PrismaClient } from '@prisma/client';

// Single Prisma Client instance with optimized connection pooling
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool configuration for better stability
  __internal: {
    engine: {
      // Increase connection pool size for better concurrency
      connectionLimit: 10,
      // Reduce connection timeout to prevent hanging connections
      connectTimeout: 20000,
      // Pool timeout to prevent connection exhaustion
      poolTimeout: 20000,
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Enhanced graceful shutdown with connection cleanup
const gracefulShutdown = async () => {
  console.log('🔄 Gracefully shutting down Prisma...');
  try {
    await prisma.$disconnect();
    console.log('✅ Prisma disconnected successfully');
  } catch (error) {
    console.error('❌ Error during Prisma shutdown:', error);
  }
};

process.on('beforeExit', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Health check function to test database connectivity
export const checkDatabaseHealth = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error.message, 
      timestamp: new Date().toISOString() 
    };
  }
};

export default prisma;
