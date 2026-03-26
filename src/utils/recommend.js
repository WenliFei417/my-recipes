/* ============================================
   AI 推荐工具函数
   
   负责：
   1. 精简菜谱数据（砍掉 steps、tips、image 等大字段）
   2. 发请求到 /api/recommend
   3. 返回推荐结果
   ============================================ */

/**
 * 调用 AI 推荐接口
 * @param {string} query - 用户输入的需求，如"想吃辣的"
 * @param {Array} recipes - 完整菜谱数组（从 App 的 state 传入）
 * @param {string} language - 当前语言 "zh" | "en"
 * @returns {Promise<{ recommendations: Array, message: string }>}
 */
export async function getAiRecommendation(query, recipes, language = 'zh') {
  // 精简菜谱数据，只保留 AI 推荐需要的字段
  // 完整对象里的 steps、tips、image 对推荐没用，还浪费 token 费用
  const recipeSummaries = recipes.map((r) => ({
    id: r.id,
    nameZh: r.nameZh,
    nameEn: r.nameEn,
    category: r.category,
    difficulty: r.difficulty,
    tags: r.tags,
    ingredients: r.ingredients,
  }));

  const response = await fetch('/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      recipes: recipeSummaries,
      language,
    }),
  });

  if (!response.ok) {
    throw new Error('推荐服务暂时不可用');
  }

  return await response.json();
}
