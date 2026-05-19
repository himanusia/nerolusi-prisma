-- CreateEnum
CREATE TYPE "public"."SubjectMode" AS ENUM ('tka', 'utbk');

-- AlterTable
ALTER TABLE "public"."Subject" ADD COLUMN     "mode" "public"."SubjectMode" NOT NULL DEFAULT 'tka';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "school" TEXT;

-- CreateTable
CREATE TABLE "public"."UserMajorChoice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "majorId" INTEGER NOT NULL,
    "choiceNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMajorChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."University" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Major" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "universityId" INTEGER NOT NULL,
    "passingGrade" INTEGER,

    CONSTRAINT "Major_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MainPageVideo" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,

    CONSTRAINT "MainPageVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Module" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "subjectId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserMajorChoice_userId_majorId_key" ON "public"."UserMajorChoice"("userId", "majorId");

-- AddForeignKey
ALTER TABLE "public"."UserMajorChoice" ADD CONSTRAINT "UserMajorChoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserMajorChoice" ADD CONSTRAINT "UserMajorChoice_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "public"."Major"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Major" ADD CONSTRAINT "Major_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "public"."University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Module" ADD CONSTRAINT "Module_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
