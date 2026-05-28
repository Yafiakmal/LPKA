-- CreateTable
CREATE TABLE "_user" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "hashed_password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "user_role_id" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "pk__user" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "borrowing" (
    "id" BIGSERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "returned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "description" TEXT,

    CONSTRAINT "pk_borrowing" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "name" VARCHAR(255) NOT NULL,
    "stock" INTEGER NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "borrowed" BOOLEAN NOT NULL DEFAULT false,
    "borrowed_amount" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "id" SERIAL NOT NULL,

    CONSTRAINT "pk_products" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taking" (
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "id" SERIAL NOT NULL,
    "description" TEXT,

    CONSTRAINT "pk_taking" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit" (
    "name" VARCHAR(100) NOT NULL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "pk_unit" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role" (
    "name" VARCHAR(100) NOT NULL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "pk_user_role" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" BIGSERIAL NOT NULL,
    "selector" VARCHAR(32) NOT NULL,
    "validator_hash" TEXT NOT NULL,
    "expired_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(6),
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unq__user" ON "_user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "unique_nama_not_deleted" ON "products"("name") WHERE (deleted_at IS NULL);

-- CreateIndex
CREATE UNIQUE INDEX "unq_user_sessions_selector" ON "user_sessions"("selector");

-- CreateIndex
CREATE INDEX "idx_user_sessions_active" ON "user_sessions"("selector") WHERE (revoked_at IS NULL);

-- AddForeignKey
ALTER TABLE "_user" ADD CONSTRAINT "fk__user_user_role" FOREIGN KEY ("user_role_id") REFERENCES "user_role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrowing" ADD CONSTRAINT "fk_borrowing__user" FOREIGN KEY ("user_id") REFERENCES "_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrowing" ADD CONSTRAINT "fk_borrowing_products" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "fk_products_unit" FOREIGN KEY ("unit_id") REFERENCES "unit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "taking" ADD CONSTRAINT "fk_taking__user" FOREIGN KEY ("user_id") REFERENCES "_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taking" ADD CONSTRAINT "fk_taking_products" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "fk_user_sessions__user" FOREIGN KEY ("user_id") REFERENCES "_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
