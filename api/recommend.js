/* ============================================
   Vercel Serverless Function - AI 菜谱推荐
   
   推荐流程：
   1. 前端发来用户的需求（如"想吃辣的"）+ 菜谱列表 + 当前语言
   2. 这个 function 把菜谱精简后，连同用户需求一起发给 OpenAI
   3. OpenAI 从菜谱列表中挑选最匹配的 1-3 道菜，返回 JSON
   4. 把推荐结果返回给前端
   
   为什么这步需要服务端？
   因为 OPENAI_API_KEY 是机密信息，不能暴露在前端代码里。
   和 auth.js 一样，放在 serverless function 里，用户看不到。
   ============================================ */

export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 从请求体中取出前端发来的数据
  const { query, recipes, language } = req.body;

  // 校验必填字段
  if (!query || !recipes || !Array.isArray(recipes)) {
    return res.status(400).json({ error: 'Missing required fields: query, recipes' });
  }

  // ---- 第一步：精简菜谱数据，减少 token 消耗 ----
  /*
    完整的菜谱对象包含 steps、tips、image 等大段内容，
    但 AI 推荐只需要知道"这道菜叫什么、什么分类、什么口味"，
    所以我们只发送必要字段，能省一半以上的 token 费用。
  */
  const isZh = language === 'zh';
  const recipeSummaries = recipes.map((r) => ({
    id: r.id,
    name: isZh ? r.nameZh : r.nameEn,
    category: r.category,
    difficulty: r.difficulty,
    tags: isZh ? r.tags?.zh : r.tags?.en,
    ingredients: isZh ? r.ingredients?.zh : r.ingredients?.en,
  }));

  // ---- 第二步：构建 system prompt ----
  /*
    System prompt 告诉 AI 它的角色和输出规则。
    关键规则：
    - 只能从提供的菜谱列表中推荐，不能编造
    - 返回严格的 JSON 格式（配合 response_format 双重保障）
    - 语气友好自然
  */
  const systemPrompt = isZh
    ? `你是"Dine with Wenli"菜谱网站的智能推荐助手。

规则：
1. 你只能从用户提供的菜谱列表中推荐，绝对不要编造不存在的菜谱
2. 推荐 1-3 道最匹配的菜谱
3. 每道菜给出简短的推荐理由（1-2 句话）
4. 如果没有匹配的菜谱，返回空的 recommendations 数组，并在 message 中友好说明
5. 语气友好自然，像朋友推荐美食一样

返回严格的 JSON 格式：
{
  "recommendations": [
    { "id": "菜谱id", "name": "菜谱名称", "reason": "推荐理由" }
  ],
  "message": "给用户的友好回复"
}`
    : `You are a smart recipe recommendation assistant for "Dine with Wenli", a personal recipe website.

Rules:
1. You can ONLY recommend recipes from the provided recipe list. NEVER invent recipes that don't exist.
2. Recommend 1-3 best matching recipes.
3. Give a short reason (1-2 sentences) for each recommendation.
4. If no recipes match, return an empty recommendations array with a helpful message.
5. Be friendly and natural, like a friend suggesting food.

Return strict JSON format:
{
  "recommendations": [
    { "id": "recipe-id", "name": "recipe name", "reason": "why this recipe fits" }
  ],
  "message": "a friendly message to the user"
}`;

  // ---- 第三步：调用 OpenAI API ----
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        /*
          从 Vercel 环境变量里读取 API Key，
          和 auth.js 里读取 GITHUB_CLIENT_SECRET 一样的道理。
        */
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        /*
          gpt-4o-mini：性价比最高的模型
          - $0.15/百万 input tokens，$0.60/百万 output tokens
          - 对于"从列表里挑菜"这种简单任务绰绰有余
          - 如果效果不满意，改成 'gpt-4o' 就行（贵 ~15 倍，但更聪明）
        */
        response_format: { type: 'json_object' },
        /*
          JSON mode：强制模型返回合法的 JSON。
          比单纯在 prompt 里要求 "请返回 JSON" 可靠得多，
          不会出现多余的 ```json 标记或闲聊文字。
        */
        temperature: 0.7,
        /*
          temperature 控制输出的"创意程度"：
          0 = 非常确定性，每次都差不多的回答
          1 = 比较随机/有创意
          0.7 = 适中，既不死板也不乱来
        */
        max_tokens: 512,
        /*
          限制输出长度，推荐 1-3 道菜 + 理由不需要太长。
          也是防止意外产生超长回复导致费用飙升的安全措施。
        */
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `菜谱列表：\n${JSON.stringify(recipeSummaries)}\n\n用户需求：${query}`,
          },
        ],
      }),
    });

    // ---- 第四步：处理 OpenAI 的响应 ----

    // 如果 OpenAI 返回了错误（比如 key 无效、余额不足）
    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      return res.status(500).json({ error: 'AI service temporarily unavailable' });
    }

    const data = await response.json();

    // 从响应中提取 AI 生成的文本
    const text = data.choices?.[0]?.message?.content;
    /*
      OpenAI Chat Completions API 的响应结构：
      {
        choices: [
          {
            message: {
              role: "assistant",
              content: "{ ... }" ← AI 生成的 JSON 字符串在这里
            }
          }
        ]
      }
    */

    if (!text) {
      return res.status(500).json({ error: 'Empty response from AI' });
    }

    // 解析 JSON
    try {
      const result = JSON.parse(text);
      return res.status(200).json(result);
    } catch (parseError) {
      /*
        理论上开了 JSON mode 不会走到这里，
        但加个兜底：万一解析失败，把原始文本当 message 返回，
        前端至少能显示点东西，不至于白屏。
      */
      console.error('JSON parse error:', parseError, 'Raw text:', text);
      return res.status(200).json({
        recommendations: [],
        message: text,
      });
    }
  } catch (error) {
    // 网络错误、超时等意外情况
    console.error('Recommend error:', error);
    return res.status(500).json({ error: 'Failed to get recommendation' });
  }
}
