/* ============================================
   GitHub API 工具函数
   
   所有和 GitHub 仓库交互的操作都在这里：
   - 读取菜谱数据（JSON 文件）
   - 保存菜谱数据（更新 JSON 文件）
   - 上传图片
   - 删除图片
   
   GitHub API 文档：https://docs.github.com/en/rest
   ============================================ */

/*
  这些值从环境变量读取（.env 文件里配置）。
  REACT_APP_ 前缀是 Create React App 的规定，
  只有这个前缀的环境变量才能在前端代码里访问到。
*/
const GITHUB_OWNER = process.env.REACT_APP_GITHUB_OWNER;   // 你的 GitHub 用户名
const GITHUB_REPO = process.env.REACT_APP_GITHUB_REPO;     // 仓库名
const DATA_PATH = 'data/recipes.json';                      // 菜谱 JSON 文件在仓库中的路径
const IMAGE_DIR = 'images';                                 // 图片目录

// GitHub API 的基础 URL
const API_BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;


/* ============================================
   读取菜谱数据
   
   这个函数不需要登录就能调用（公开仓库）。
   它去 GitHub 仓库读取 recipes.json 文件的内容。
   ============================================ */
export async function fetchRecipes() {
  /*
    async/await 是处理异步操作的写法。
    网络请求需要时间，await 会"等"请求完成后再继续。
    async 标记这个函数是异步函数，里面才能用 await。
  */
  try {
    const response = await fetch(`${API_BASE}/contents/${DATA_PATH}`);
    /*
      fetch() 是浏览器内置的发请求函数。
      GitHub API 的 /contents/ 端点返回仓库中指定文件的内容。
    */

    if (!response.ok) {
      // 如果文件还不存在（404），返回空数组
      if (response.status === 404) {
        return [];
      }
      throw new Error(`Failed to fetch recipes: ${response.status}`);
    }

    const data = await response.json();
    /*
      GitHub API 返回的是 JSON 格式，
      其中 data.content 是文件内容（base64 编码的）。
      base64 是一种把二进制数据编码成文字的方式。
    */

    // 解码 base64 → 原始字符串 → 解析成 JavaScript 对象
    const content = decodeBase64(data.content);
    return JSON.parse(content);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }
}


/* ============================================
   保存菜谱数据
   
   需要登录（token）才能调用。
   把整个菜谱数组写入 recipes.json 文件。
   ============================================ */
export async function saveRecipes(recipes, token) {
  /*
    参数：
    - recipes: 完整的菜谱数组
    - token: GitHub OAuth 登录后拿到的 access token
  */

  // 先获取当前文件的 SHA 值（GitHub 更新文件时需要提供它）
  let sha = null;
  try {
    const existing = await fetch(`${API_BASE}/contents/${DATA_PATH}`, {
      headers: { Authorization: `token ${token}` },
    });
    if (existing.ok) {
      const data = await existing.json();
      sha = data.sha;
      /*
        SHA 是文件的唯一标识（哈希值）。
        GitHub 要求更新文件时必须提供当前文件的 SHA，
        这是一种乐观锁机制，防止多人同时编辑导致冲突。
      */
    }
  } catch (e) {
    // 文件不存在，sha 保持 null，将会创建新文件
  }

  // 把菜谱数组转成格式化的 JSON 字符串，再编码成 base64
  const content = encodeBase64(JSON.stringify(recipes, null, 2));
  /*
    JSON.stringify 的三个参数：
    1. 要转换的数据
    2. null（不做过滤）
    3. 2（缩进 2 个空格，让文件更可读）
  */

  // 调用 GitHub API 更新文件
  const response = await fetch(`${API_BASE}/contents/${DATA_PATH}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Update recipes - ${new Date().toLocaleString()}`,
      /* message 是 Git 提交信息，会显示在仓库的提交历史里 */
      content: content,
      ...(sha ? { sha } : {}),
      /*
        展开运算符 ...：如果 sha 有值，就加上 { sha: xxx }，
        如果没有（新文件），就什么都不加。
        这是一种简洁的条件添加属性的写法。
      */
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to save recipes: ${error.message}`);
  }

  return await response.json();
}


/* ============================================
   上传图片
   
   把图片文件上传到仓库的 images/ 目录。
   ============================================ */
export async function uploadImage(file, fileName, token) {
  /*
    参数：
    - file: File 对象（用户选择的文件）
    - fileName: 保存的文件名（如 'mapo-tofu.jpg'）
    - token: GitHub access token
  */
  const path = `${IMAGE_DIR}/${fileName}`;

  // 先检查文件是否已存在（获取 SHA）
  let sha = null;
  try {
    const existing = await fetch(`${API_BASE}/contents/${path}`, {
      headers: { Authorization: `token ${token}` },
    });
    if (existing.ok) {
      const data = await existing.json();
      sha = data.sha;
    }
  } catch (e) {
    // 文件不存在
  }

  // 把图片文件转成 base64
  const base64Content = await fileToBase64(file);

  // 上传到 GitHub
  const response = await fetch(`${API_BASE}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Upload image: ${fileName}`,
      content: base64Content,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  return await response.json();
}


/* ============================================
   删除图片
   ============================================ */
export async function deleteImage(fileName, token) {
  const path = `${IMAGE_DIR}/${fileName}`;

  // 获取文件 SHA（删除必须提供）
  const existing = await fetch(`${API_BASE}/contents/${path}`, {
    headers: { Authorization: `token ${token}` },
  });

  if (!existing.ok) return; // 文件不存在就不用删

  const data = await existing.json();

  const response = await fetch(`${API_BASE}/contents/${path}`, {
    method: 'DELETE',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Delete image: ${fileName}`,
      sha: data.sha,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}


/* ============================================
   获取图片的显示 URL
   
   GitHub 仓库里的原始文件可以通过 raw.githubusercontent.com 访问。
   ============================================ */
export function getImageUrl(fileName) {
  if (!fileName) return null;
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${IMAGE_DIR}/${fileName}`;
}


/* ============================================
   辅助函数
   ============================================ */

// 把 base64 字符串解码成普通字符串（支持中文）
function decodeBase64(base64String) {
  /*
    GitHub API 返回的 base64 可能包含换行符，先去掉。
    然后用 atob 解码成二进制字符串，
    再用 TextDecoder 处理 UTF-8 编码的中文。
  */
  const cleaned = base64String.replace(/\n/g, '');
  const binaryString = atob(cleaned);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new TextDecoder('utf-8').decode(bytes);
}

// 把普通字符串编码成 base64（支持中文）
function encodeBase64(string) {
  const bytes = new TextEncoder().encode(string);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

// 把 File 对象转成 base64 字符串（不含前缀 data:image/...）
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    /*
      Promise 是处理异步操作的另一种方式。
      FileReader 读取文件是异步的，完成后通过回调通知我们。
    */
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result 格式：data:image/jpeg;base64,/9j/4AAQ...
      // 我们只要逗号后面的纯 base64 部分
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}