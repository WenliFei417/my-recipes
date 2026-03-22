/* ============================================
   Vercel Serverless Function - GitHub OAuth Token 交换
   
   OAuth 登录流程：
   1. 用户点"登录" → 跳转到 GitHub 授权页面
   2. 用户同意授权 → GitHub 跳回我们的网站，URL 带一个 code 参数
   3. 前端拿到 code，发到这个 serverless function
   4. 这个 function 用 code + client_secret 去 GitHub 换取 access_token
   5. 把 token 返回给前端
   
   为什么这步需要服务端？
   因为 client_secret 是机密信息，不能暴露在前端代码里。
   放在 serverless function 里，它只在服务端运行，用户看不到。
   ============================================ */

export default async function handler(req, res) {
  /*
    Vercel Serverless Function 的标准格式：
    导出一个 async function，接收 req（请求）和 res（响应）。
    当有人访问 /api/auth 这个 URL 时，这个函数就会执行。
  */

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 从请求体中取出前端发来的 code
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Missing code parameter' });
  }

  try {
    // 用 code 去 GitHub 换取 access_token
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        /* Accept: application/json 告诉 GitHub 返回 JSON 格式，
           不加的话会返回 URL 编码格式的字符串 */
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        /* 这两个值从 Vercel 的环境变量里读取，
           不会出现在前端代码中，安全！ */
        code: code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error_description });
    }

    // 拿到 token 后，验证这个用户是不是仓库的 owner
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${data.access_token}` },
    });
    const user = await userResponse.json();

    // 只有仓库 owner 才能当管理员
    if (user.login !== process.env.GITHUB_OWNER) {
      return res.status(403).json({
        error: 'Not authorized. Only the repository owner can manage recipes.',
      });
    }

    // 验证通过，返回 token 和用户名
    return res.status(200).json({
      access_token: data.access_token,
      username: user.login,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Authentication failed' });
  }
}