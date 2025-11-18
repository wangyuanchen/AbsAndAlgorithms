import { z } from "zod";
import { Hono } from "hono";
// import { eq, and } from "drizzle-orm"; // 不需要数据库
// import { verifyAuth } from "@hono/auth-js"; // 禁用认证
import { zValidator } from "@hono/zod-validator";

// import { db } from "@/db/drizzle"; // 不需要数据库
// import { menus, recipes } from "@/db/schema"; // 不需要数据库
import { generateMenuWithAI } from "@/lib/azure-openai";

const app = new Hono()
  .get(
    "/",
    // verifyAuth(), // 禁用认证
    async (c) => {
      // 不使用数据库，返回空数组
      return c.json({ data: [] });
    },
  )
  .get(
    "/:id",
    // verifyAuth(), // 禁用认证
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      // 不使用数据库
      return c.json({ error: "Database not available" }, 404);
    },
  )
  .post(
    "/",
    // verifyAuth(), // 临时禁用认证
    zValidator(
      "json",
      z.object({
        ingredients: z.string(),
        name: z.string().optional(),
      }),
    ),
    async (c) => {
      // const auth = c.get("authUser");
      const { ingredients, name } = c.req.valid("json");

      try {
        // 使用 Azure OpenAI 生成菜单
        const aiResponse = await generateMenuWithAI(ingredients);
        
        // 直接返回 AI 生成的结果，不保存到数据库
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

        // 格式化食谱数据
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
    // verifyAuth(), // 禁用认证
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      // 不使用数据库
      return c.json({ error: "Database not available" }, 404);
    },
  );

export default app;