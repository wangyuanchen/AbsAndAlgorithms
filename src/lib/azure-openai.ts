import { AzureOpenAI } from "openai";

export const azureOpenAI = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  apiVersion: process.env.AZURE_OPENAI_VERSION!,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME!,
});

export const generateMenuWithAI = async (ingredients: string) => {
  const prompt = `你是一位专业的营养师和健身教练。根据以下食材，生成一份健康的健身减脂菜单。

食材: ${ingredients}

请生成一份包含以下信息的菜单:
1. 菜单名称
2. 总营养成分 (蛋白质/克, 碳水化合物/克, 脂肪/克, 总卡路里)
3. 2-3道菜的详细食谱，每道菜包括:
   - 菜名
   - 所需食材及用量
   - 烹饪步骤
   - 准备时间(分钟)
   - 烹饪时间(分钟)
   - 份数

请以 JSON 格式返回，格式如下:
{
  "menuName": "菜单名称",
  "nutrition": {
    "protein": 数字,
    "carbs": 数字,
    "fat": 数字,
    "calories": 数字
  },
  "recipes": [
    {
      "name": "菜名",
      "ingredients": [
        {"name": "食材名", "quantity": "用量"}
      ],
      "instructions": ["步骤1", "步骤2"],
      "prepTime": 数字,
      "cookTime": 数字,
      "servings": 数字
    }
  ]
}

只返回 JSON，不要其他文字说明。`;

  try {
    const response = await azureOpenAI.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "你是一位专业的营养师和健身教练，擅长根据食材生成健康的减脂菜单。"
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
