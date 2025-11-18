-- Create menu table
CREATE TABLE IF NOT EXISTS "menu" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"ingredients" text NOT NULL,
	"protein" integer NOT NULL,
	"carbs" integer NOT NULL,
	"fat" integer NOT NULL,
	"calories" integer NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);

-- Create recipe table
CREATE TABLE IF NOT EXISTS "recipe" (
	"id" text PRIMARY KEY NOT NULL,
	"menuId" text NOT NULL,
	"name" text NOT NULL,
	"instructions" text NOT NULL,
	"ingredients" text NOT NULL,
	"prepTime" integer NOT NULL,
	"cookTime" integer NOT NULL,
	"servings" integer NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "menu" ADD CONSTRAINT "menu_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "recipe" ADD CONSTRAINT "recipe_menuId_menu_id_fk" FOREIGN KEY ("menuId") REFERENCES "public"."menu"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;