-- CreateEnum
CREATE TYPE "public"."ModuleType" AS ENUM ('catatan', 'bahan_materi');

-- AlterTable
ALTER TABLE "public"."Module" ADD COLUMN     "type" "public"."ModuleType" NOT NULL DEFAULT 'bahan_materi';
