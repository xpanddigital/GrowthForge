import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/types/database.ts",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "postgresql://postgres:")}`
      : "postgresql://postgres:postgres@localhost:54322/postgres",
  },
});
