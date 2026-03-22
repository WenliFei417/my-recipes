/* ============================================
   中英文翻译工具 (i18n = internationalization)
   
   i18n 是"国际化"的缩写（i 和 n 之间有 18 个字母）。
   这个文件管理网站所有界面文字的中英文版本。
   ============================================ */

// 翻译字典：key 是文字的标识符，值是中英文对照
const translations = {
  // --- 网站标题和标语 ---
  siteTitle: {
    zh: '一起吃饭吧',
    en: 'Dine with Wenli & Zeyong',
  },
  siteSlogan: {
    zh: '我把心意，慢慢做进每一道菜里',
    en: 'Cooking is my way of caring',
  },

  // --- 筛选栏 ---
  searchPlaceholder: {
    zh: '搜菜名...',
    en: 'Dish name...',
  },
  allCategories: {
    zh: '全部分类',
    en: 'All Categories',
  },
  allDifficulties: {
    zh: '全部难度',
    en: 'All Levels',
  },
  filterByIngredient: {
    zh: '食材...',
    en: 'ingredient...',
  },

  // --- 菜谱卡片 ---
  ingredients: {
    zh: '食材',
    en: 'Ingredients',
  },
  steps: {
    zh: '做法步骤',
    en: 'Steps',
  },
  tips: {
    zh: '💡 小贴士',
    en: '💡 Tips',
  },
  noSteps: {
    zh: '这道菜还没写步骤，大厨凭感觉做的 😎',
    en: 'No steps yet — the chef cooks by instinct 😎',
  },

  // --- 难度 ---
  easy: {
    zh: '简单',
    en: 'Easy',
  },
  medium: {
    zh: '中等',
    en: 'Medium',
  },
  hard: {
    zh: '费功夫',
    en: 'Advanced',
  },

  // --- 管理功能 ---
  login: {
    zh: '管理员登录',
    en: 'Admin Login',
  },
  logout: {
    zh: '退出登录',
    en: 'Logout',
  },
  addRecipe: {
    zh: '✨ 添加新菜谱',
    en: '✨ Add New Recipe',
  },
  editRecipe: {
    zh: '编辑',
    en: 'Edit',
  },
  deleteRecipe: {
    zh: '删除',
    en: 'Delete',
  },
  confirmDelete: {
    zh: '确定要删掉这道菜吗？删了就没了哦 😢',
    en: 'Are you sure you want to delete this recipe? 😢',
  },
  save: {
    zh: '保存',
    en: 'Save',
  },
  cancel: {
    zh: '取消',
    en: 'Cancel',
  },

  // --- 表单字段 ---
  formNameZh: {
    zh: '中文菜名',
    en: 'Chinese Name',
  },
  formNameEn: {
    zh: '英文菜名',
    en: 'English Name',
  },
  formCategory: {
    zh: '分类',
    en: 'Category',
  },
  formDifficulty: {
    zh: '难度',
    en: 'Difficulty',
  },
  formIngredients: {
    zh: '食材（每行一项）',
    en: 'Ingredients (one per line)',
  },
  formSteps: {
    zh: '步骤（每行一步，可不填）',
    en: 'Steps (one per line, optional)',
  },
  formTags: {
    zh: '标签（用逗号分隔，可不填）',
    en: 'Tags (comma separated, optional)',
  },
  formTips: {
    zh: '小贴士（可不填）',
    en: 'Tips (optional)',
  },
  formImage: {
    zh: '菜品图片',
    en: 'Recipe Image',
  },

  // --- 状态提示 ---
  loading: {
    zh: '加载中...',
    en: 'Loading...',
  },
  saving: {
    zh: '保存中...',
    en: 'Saving...',
  },
  noResults: {
    zh: '没有找到匹配的菜谱，换个关键词试试？ 🔍',
    en: 'No recipes found. Try different keywords? 🔍',
  },
  totalRecipes: {
    zh: '',
    en: '',
  },
};

/* 
  t 函数 —— 翻译的核心函数
  用法：t('siteTitle', 'zh') 返回 '我的小厨房'
       t('siteTitle', 'en') 返回 'My Little Kitchen'
  
  参数：
    - key: 翻译字典里的标识符（如 'siteTitle'）
    - lang: 当前语言（'zh' 或 'en'）
  
  如果 key 找不到，返回 key 本身，方便调试时发现拼写错误
*/
export function t(key, lang) {
  if (translations[key] && translations[key][lang]) {
    return translations[key][lang];
  }
  return key; // 找不到翻译就原样返回，不会报错
}

// 导出翻译字典本身（某些情况可能直接用到）
export default translations;

/* ============================================
   菜谱字段兜底函数
   
   如果当前语言的内容为空，自动回退到中文版本。
   适用于菜谱里的所有双语字段。
   
   用法：
   - 字符串字段：fallback(recipe.tips, lang)
     如果 tips.en 为空就返回 tips.zh
   - 数组字段：fallbackArray(recipe.ingredients, lang)
     如果 ingredients.en 为空数组就返回 ingredients.zh
   - 菜名：fallbackName(recipe, lang)
     如果 nameEn 为空就返回 nameZh
   ============================================ */

export function fallback(field, lang) {
  if (!field) return '';
  const value = field[lang];
  if (value && value.length > 0) return value;
  return field['zh'] || '';
}

export function fallbackArray(field, lang) {
  if (!field) return [];
  const arr = field[lang];
  if (arr && arr.length > 0) return arr;
  return field['zh'] || [];
}

export function fallbackName(recipe, lang) {
  if (lang === 'en') {
    return recipe.nameEn || recipe.nameZh || '';
  }
  return recipe.nameZh || recipe.nameEn || '';
}

export function fallbackSubName(recipe, lang) {
  if (lang === 'en') {
    return recipe.nameZh || '';
  }
  return recipe.nameEn || '';
}