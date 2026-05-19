-- AlterTable
ALTER TABLE "public"."Package" ADD COLUMN     "mode" "public"."SubjectMode" DEFAULT 'tka';

-- AlterTable
ALTER TABLE "public"."Video" ADD COLUMN     "mode" "public"."SubjectMode" NOT NULL DEFAULT 'tka';
