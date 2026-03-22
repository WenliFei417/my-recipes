/* ============================================
   示例菜谱数据
   所有文字字段都存中英文两个版本，
   用户切换语言时直接读取对应版本，无需翻译。
   ============================================ */

// 分类列表
export const CATEGORIES = [
  { id: 'veggie',  zh: '家常素菜', en: 'Homestyle Veggie',  emoji: '🥬' },
  { id: 'meat',    zh: '硬核荤菜', en: 'Hearty Meat',       emoji: '🥩' },
  { id: 'staple',  zh: '特色主食', en: 'Signature Staples',  emoji: '🍜' },
  { id: 'seafood', zh: '水产海鲜', en: 'Seafood',           emoji: '🐟' },
  { id: 'oven',    zh: '烤箱主场', en: 'Oven Specials',     emoji: '🔥' },
  { id: 'dessert', zh: '香浓甜品', en: 'Sweet Treats',      emoji: '🍰' },
  { id: 'egg',     zh: '万能鸡蛋', en: 'Egg-cellent',       emoji: '🥚' },
  { id: 'snack',   zh: '风味小吃', en: 'Savory Snacks',     emoji: '🥟' },
  { id: 'cold',    zh: '爽口凉菜', en: 'Cool & Refreshing', emoji: '🥗' },
];

// 难度列表
export const DIFFICULTIES = [
  { id: 'easy',   zh: '简单',   en: 'Easy',     emoji: '😊' },
  { id: 'medium', zh: '中等',   en: 'Medium',   emoji: '🤔' },
  { id: 'hard',   zh: '费功夫', en: 'Advanced', emoji: '💪' },
];

// 示例菜谱数据
const sampleRecipes = [
  {
    id: 'mapo-tofu',
    nameZh: '麻婆豆腐',
    nameEn: 'Mapo Tofu',
    category: 'veggie',
    difficulty: 'easy',
    ingredients: {
      zh: [
        '嫩豆腐 1盒',
        '猪肉末 100g',
        '郫县豆瓣酱 2勺',
        '花椒粉 适量',
        '蒜末 适量',
        '小葱 2根',
        '生抽 1勺',
        '淀粉水 适量',
      ],
      en: [
        '1 box soft tofu',
        '100g ground pork',
        '2 tbsp doubanjiang (chili bean paste)',
        'Sichuan peppercorn powder to taste',
        'Minced garlic to taste',
        '2 green onions',
        '1 tbsp soy sauce',
        'Starch water to taste',
      ],
    },
    steps: {
      zh: [
        '豆腐切小块，开水焯2分钟去豆腥味，捞出沥干',
        '热锅冷油，小火炒香肉末至变色',
        '加入豆瓣酱和蒜末，炒出红油',
        '加入半碗水烧开，放入豆腐轻轻推动（别搅碎！）',
        '中火煮3分钟让豆腐入味，淋入淀粉水勾芡',
        '出锅撒花椒粉和葱花，搞定！',
      ],
      en: [
        'Cut tofu into small cubes, blanch in boiling water for 2 min, drain',
        'Heat oil in wok, stir-fry ground pork on low until browned',
        'Add doubanjiang and garlic, fry until the oil turns red',
        'Add half a bowl of water, bring to boil, gently slide in tofu (don\'t stir too hard!)',
        'Simmer on medium heat for 3 min, drizzle in starch water to thicken',
        'Sprinkle Sichuan peppercorn powder and green onions, done!',
      ],
    },
    image: 'mapo-tofu.jpg',
    tags: {
      zh: ['小孩最爱', '下饭神器'],
      en: ['Kids favorite', 'Perfect with rice'],
    },
    tips: {
      zh: '豆腐焯水这步别偷懒，去腥效果差很多。花椒粉出锅再撒，香味更足。',
      en: 'Don\'t skip blanching the tofu — it really removes the beany taste. Add peppercorn powder after plating for the best aroma.',
    },
  },
  {
    id: 'hong-shao-rou',
    nameZh: '红烧肉',
    nameEn: 'Braised Pork Belly',
    category: 'meat',
    difficulty: 'medium',
    ingredients: {
      zh: [
        '五花肉 500g',
        '冰糖 30g',
        '生抽 2勺',
        '老抽 1勺',
        '料酒 2勺',
        '姜片 4片',
        '八角 2个',
        '桂皮 1小块',
      ],
      en: [
        '500g pork belly',
        '30g rock sugar',
        '2 tbsp light soy sauce',
        '1 tbsp dark soy sauce',
        '2 tbsp cooking wine',
        '4 slices ginger',
        '2 star anise',
        '1 small piece cinnamon',
      ],
    },
    steps: {
      zh: [
        '五花肉切麻将块大小，冷水下锅焯水去血沫，捞出洗净',
        '锅中少油，放冰糖小火炒至枣红色（别炒糊！）',
        '放入五花肉翻炒上色，每块都要裹上糖色',
        '加生抽、老抽、料酒，放姜片八角桂皮',
        '加开水没过肉，大火烧开后转小火炖1小时',
        '最后大火收汁，汤汁浓稠就可以出锅了',
      ],
      en: [
        'Cut pork belly into mahjong-tile-sized pieces, blanch in cold water to remove scum, rinse',
        'Heat a little oil, caramelize rock sugar on low heat until amber (don\'t burn it!)',
        'Add pork belly and toss until each piece is coated in caramel',
        'Add light soy, dark soy, cooking wine, ginger, star anise, and cinnamon',
        'Add boiling water to cover the meat, bring to boil then simmer for 1 hour',
        'Turn up heat to reduce sauce until thick and glossy, then serve',
      ],
    },
    image: 'hong-shao-rou.jpg',
    tags: {
      zh: ['硬核大菜', '适合请客'],
      en: ['Showstopper', 'Great for guests'],
    },
    tips: {
      zh: '炒糖色用小火，颜色到了马上下肉，不然会苦。一定要加开水不是冷水，冷水会让肉发紧。',
      en: 'Use low heat for caramel — add meat the moment it turns amber, or it\'ll taste bitter. Always add boiling water, not cold — cold water toughens the meat.',
    },
  },
  {
    id: 'tomato-egg',
    nameZh: '番茄炒蛋',
    nameEn: 'Tomato Scrambled Eggs',
    category: 'egg',
    difficulty: 'easy',
    ingredients: {
      zh: [
        '番茄 2个',
        '鸡蛋 3个',
        '白糖 1小勺',
        '盐 适量',
        '葱花 适量',
      ],
      en: [
        '2 tomatoes',
        '3 eggs',
        '1 tsp sugar',
        'Salt to taste',
        'Chopped green onions',
      ],
    },
    steps: {
      zh: [
        '番茄切块，鸡蛋打散加少许盐',
        '热锅多放点油，倒入蛋液炒成大块，盛出备用',
        '锅中留底油，放番茄块翻炒出汁',
        '加一小勺糖提鲜（这是秘诀！），加盐调味',
        '倒回鸡蛋翻炒均匀，撒葱花出锅',
      ],
      en: [
        'Cut tomatoes into wedges, beat eggs with a pinch of salt',
        'Heat wok with generous oil, scramble eggs into large curds, set aside',
        'Leave a little oil in wok, stir-fry tomatoes until juicy',
        'Add a teaspoon of sugar for umami (secret trick!), season with salt',
        'Return eggs to wok, toss to combine, garnish with green onions',
      ],
    },
    image: 'tomato-egg.jpg',
    tags: {
      zh: ['小孩最爱', '快手菜', '零失败'],
      en: ['Kids favorite', 'Quick & easy', 'Foolproof'],
    },
    tips: {
      zh: '',
      en: '',
    },
  },
  {
    id: 'shui-zhu-yu',
    nameZh: '水煮鱼',
    nameEn: 'Sichuan Boiled Fish',
    category: 'seafood',
    difficulty: 'hard',
    ingredients: {
      zh: [
        '草鱼 1条',
        '豆芽 200g',
        '干辣椒 一大把',
        '花椒 2勺',
        '郫县豆瓣酱 2勺',
        '蒜末 适量',
        '料酒 1勺',
        '淀粉 适量',
        '蛋清 1个',
      ],
      en: [
        '1 grass carp (or any white fish)',
        '200g bean sprouts',
        'A generous handful of dried chili peppers',
        '2 tbsp Sichuan peppercorns',
        '2 tbsp doubanjiang (chili bean paste)',
        'Minced garlic to taste',
        '1 tbsp cooking wine',
        'Starch to taste',
        '1 egg white',
      ],
    },
    steps: {
      zh: [],
      en: [],
    },
    image: 'shui-zhu-yu.jpg',
    tags: {
      zh: ['吃辣最爱', '硬核大菜'],
      en: ['Spice lovers only', 'Showstopper'],
    },
    tips: {
      zh: '鱼片要顺着纹路切，腌的时候加蛋清和淀粉，口感会特别嫩滑。',
      en: 'Slice fish along the grain. Marinate with egg white and starch for a silky, tender texture.',
    },
  },
];

export default sampleRecipes;