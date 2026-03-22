/* ============================================
   Auth 工具函数 - GitHub OAuth 登录逻辑
   
   这个文件不是一个可视化组件，而是登录相关的函数集合。
   LoginButton 的 UI 已经在 Header 里了，
   这里提供登录跳转和 token 交换的逻辑。
   ============================================ */

// GitHub OAuth App 的 Client ID（这个是公开信息，可以放前端）
const CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID;

/*
  发起 GitHub OAuth 登录
  调用后浏览器会跳转到 GitHub 的授权页面，
  用户同意后 GitHub 会跳回我们的网站。
*/
export function initiateLogin() {
  // GitHub OAuth 授权 URL
  const authUrl = new URL('https://github.com/login/oauth/authorize');

  /*
    URL 参数说明：
    - client_id: 你注册的 OAuth App 的 ID
    - redirect_uri: 用户授权后跳回的地址（你的网站地址）
    - scope: 请求的权限范围
      - 'repo' 表示读写仓库的权限（我们需要它来修改菜谱数据和上传图片）
  */
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', window.location.origin);
  /* window.location.origin 就是当前网站的根地址，
     比如 http://localhost:3000 或 https://你的域名.vercel.app */
  authUrl.searchParams.set('scope', 'repo');

  // 跳转到 GitHub 授权页面
  window.location.href = authUrl.toString();
}


/*
  处理 GitHub 跳回后的 token 交换
  GitHub 跳回时 URL 会带一个 ?code=xxx 参数，
  我们把这个 code 发给我们的 serverless function 换取 token。
*/
export async function handleAuthCallback() {
  // 从 URL 中提取 code 参数
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (!code) return null; // URL 里没有 code，说明不是从 GitHub 跳回的

  try {
    // 把 code 发给我们的 serverless function
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // 登录成功，清除 URL 中的 code 参数（让 URL 更干净）
    window.history.replaceState({}, '', window.location.origin);
    /*
      replaceState 修改浏览器地址栏的 URL，但不会触发页面刷新。
      把 ?code=xxx 去掉，用户看到的就是干净的首页地址。
    */

    return data; // 返回 { access_token, username }
  } catch (error) {
    console.error('Auth error:', error);
    // 清除 URL 中的 code
    window.history.replaceState({}, '', window.location.origin);
    throw error;
  }
}