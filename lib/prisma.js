// import { PrismaClient } from "@prisma/client";

// export const db = globalThis.prisma || new PrismaClient();

// if (process.env.NODE_ENV !== "production") {
//   globalThis.prisma = db;
// }

import { PrismaClient } from "@prisma/client";

// Use globalThis to avoid creating multiple instances during dev (Hot Reload)
export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
