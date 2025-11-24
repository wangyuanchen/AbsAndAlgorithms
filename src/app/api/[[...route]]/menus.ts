import { z } from "zod";
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";
import { zValidator } from "@hono/zod-validator";

import { db } from "@/db/drizzle";
import { subscriptions } from "@/db/schema";
import { generateMenuWithAI } from "@/lib/azure-openai";

const app = new Hono()
  .get(
    "/",
    // Public endpoint - list menus (empty for now)
    async (c) => {
      // Not using database, return empty array
      return c.json({ data: [] });
    },
  )
  .get(
    "/:id",
    // Public endpoint - get menu by id
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      // Not using database
      return c.json({ error: "Database not available" }, 404);
    },
  )
  .post(
    "/",
    verifyAuth(), // Require authentication for AI menu generation
    zValidator(
      "json",
      z.object({
        ingredients: z.string(),
        name: z.string().optional(),
      }),
    ),
    async (c) => {
      const auth = c.get("authUser");
      
      if (!auth.token?.id) {
        return c.json({ error: "Authentication required" }, 401);
      }

      const userId = auth.token.id as string;

      // Check subscription status
      const userSubscription = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .limit(1);

      const hasActiveSubscription = 
        userSubscription.length > 0 &&
        userSubscription[0].status === "active" &&
        userSubscription[0].stripeCurrentPeriodEnd.getTime() > Date.now();

      if (!hasActiveSubscription) {
        return c.json({ 
          error: "Active subscription required to generate menus",
          code: "SUBSCRIPTION_REQUIRED" 
        }, 403);
      }

      const { ingredients, name } = c.req.valid("json");

      try {
        // Use Azure OpenAI to generate menu
        const aiResponse = await generateMenuWithAI(ingredients);
        
        // Return AI generated result directly, don't save to database
        const menuData = {
          id: crypto.randomUUID(),
          name: name || aiResponse.menuName,
          ingredients,
          protein: aiResponse.nutrition.protein,
          carbs: aiResponse.nutrition.carbs,
          fat: aiResponse.nutrition.fat,
          calories: aiResponse.nutrition.calories,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Format recipe data
        const recipesData = aiResponse.recipes.map((recipe: any) => ({
          id: crypto.randomUUID(),
          menuId: menuData.id,
          name: recipe.name,
          instructions: recipe.instructions,
          ingredients: recipe.ingredients,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          servings: recipe.servings,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        return c.json({ 
          data: {
            ...menuData,
            recipes: recipesData
          }
        });
      } catch (error) {
        console.error('AI Menu Generation Error:', error);
        return c.json({ error: "Failed to generate menu" }, 500);
      }
    },
  )
  .delete(
    "/:id",
    // Public endpoint for now (no database)
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      // Not using database
      return c.json({ error: "Database not available" }, 404);
    },
  );

export default app;