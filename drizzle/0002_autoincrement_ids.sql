-- Modify menu table to use auto-incrementing ID
ALTER TABLE "menu" DROP CONSTRAINT "menu_pkey";
ALTER TABLE "menu" DROP COLUMN "id";
ALTER TABLE "menu" ADD COLUMN "id" SERIAL PRIMARY KEY;

-- Modify recipe table to use auto-incrementing ID
ALTER TABLE "recipe" DROP CONSTRAINT "recipe_pkey";
ALTER TABLE "recipe" DROP COLUMN "id";
ALTER TABLE "recipe" ADD COLUMN "id" SERIAL PRIMARY KEY;

-- Modify subscription table to use auto-incrementing ID
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_pkey";
ALTER TABLE "subscription" DROP COLUMN "id";
ALTER TABLE "subscription" ADD COLUMN "id" SERIAL PRIMARY KEY;