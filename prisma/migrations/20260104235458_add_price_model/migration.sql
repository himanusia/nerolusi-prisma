-- CreateTable
CREATE TABLE "Price" (
    "id" SERIAL NOT NULL,
    "paketUtbkPrice" INTEGER NOT NULL,
    "paketTkaPrice" INTEGER NOT NULL,
    "tokenPrice" INTEGER NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);
