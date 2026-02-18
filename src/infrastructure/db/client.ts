/**
 * Database Client
 * Infrastructure Layer
 * 
 * Purpose: Singleton Prisma client for database connections
 * 
 * Why: Prevents multiple Prisma clients in development (hot reload issue)
 * 
 * Layer Rules:
 * - Part of infrastructure layer
 * - Used by repositories only
 * - Never imported in domain or application layers
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
