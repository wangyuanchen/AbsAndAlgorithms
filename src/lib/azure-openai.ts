import { AzureOpenAI } from "openai";

export const azureOpenAI = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  apiVersion: process.env.AZURE_OPENAI_VERSION!,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME!,
});

export const generateMenuWithAI = async (ingredients: string) => {
  const prompt = `You are a professional nutritionist and fitness coach. Based on the following ingredients, generate a healthy fitness and weight loss menu.

Ingredients: ${ingredients}

Please generate a menu with the following information:
1. Menu name
2. Total nutrition (protein/g, carbs/g, fat/g, total calories)
3. 2-3 detailed recipes, each including:
   - Recipe name
   - Required ingredients with quantities
   - Cooking steps
   - Prep time (minutes)
   - Cook time (minutes)
   - Servings

Return in JSON format as follows:
{
  "menuName": "Menu Name",
  "nutrition": {
    "protein": number,
    "carbs": number,
    "fat": number,
    "calories": number
  },
  "recipes": [
    {
      "name": "Recipe Name",
      "ingredients": [
        {"name": "Ingredient Name", "quantity": "Amount"}
      ],
      "instructions": ["Step 1", "Step 2"],
      "prepTime": number,
      "cookTime": number,
      "servings": number
    }
  ]
}

Return ONLY the JSON, no additional text.`;

  try {
    const response = await azureOpenAI.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional nutritionist and fitness coach who specializes in creating healthy weight loss menus based on ingredients. Always respond in English."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME!,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    // 解析 JSON 响应
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid JSON response from AI");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Azure OpenAI Error:", error);
    throw error;
  }
};
