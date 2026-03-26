/* ============================================
   App 组件 - 整个应用的"总指挥"
   ============================================ */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import sampleRecipes, { CATEGORIES, DIFFICULTIES } from './data/sampleRecipes';
import { t, fallback, fallbackArray, fallbackName, fallbackSubName } from './utils/i18n';
import { fetchRecipes, saveRecipes, uploadImage, deleteImage, getImageUrl } from './utils/github';
import { initiateLogin, handleAuthCallback } from './components/Auth/LoginButton';
import Header from './components/Header/Header';
import FilterBar from './components/FilterBar/FilterBar';
import Sidebar from './components/Sidebar/Sidebar';
import RecipeForm from './components/RecipeForm/RecipeForm';
import AiRecommend from './components/AiRecommend/AiRecommend';

function App() {
  /* ====== 状态 ====== */
  const [lang, setLang] = useState('en');
  const [recipes, setRecipes] = useState(sampleRecipes);
  const [isLoading, setIsLoading] = useState(true);

  // 筛选
  const [searchText, setSearchText] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [ingredientFilter, setIngredientFilter] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // 展开详情
  const [expandedRecipeId, setExpandedRecipeId] = useState(null);

  // 管理员
  const [isAdmin, setIsAdmin] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [adminUsername, setAdminUsername] = useState('');

  // 表单
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sidebar
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // DOM 引用
  const contentRef = useRef(null);
  const categoryRefs = useRef({});
  const initCalled = useRef(false);
  /*
    initCalled 用来防止 React StrictMode 下 useEffect 执行两次。
    useRef 的值在重新渲染之间保持不变，而且修改它不会触发重新渲染。
    第一次执行时设为 true，第二次发现已经是 true 就跳过。
  */

  /* ====== 初始化：加载数据 + 处理 OAuth 回调 ====== */
  useEffect(() => {
    if (initCalled.current) return; // 防止重复执行
    initCalled.current = true;

    async function init() {
      // 1. 检查 URL 里有没有 OAuth 的 code（从 GitHub 跳回来的）
      try {
        const authResult = await handleAuthCallback();
        if (authResult) {
          setAuthToken(authResult.access_token);
          setAdminUsername(authResult.username);
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Login failed:', error);
        alert(lang === 'zh' ? '登录失败，请重试' : 'Login failed, please try again');
      }

      // 2. 从 GitHub 加载菜谱数据
      try {
        const data = await fetchRecipes();
        if (data && data.length > 0) {
          setRecipes(data);
        }
      } catch (error) {
        console.error('Failed to load recipes:', error);
      }

      setIsLoading(false);
    }

    init();
  }, []);

  /* ====== 收集所有标签（去重，用于标签筛选下拉框） ====== */
  const allTags = [...new Set(
    recipes.flatMap((r) => fallbackArray(r.tags, lang))
  )].filter(Boolean).sort();

  /* ====== 筛选逻辑 ====== */
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      searchText === '' ||
      recipe.nameZh.includes(searchText) ||
      recipe.nameEn.toLowerCase().includes(searchText.toLowerCase()) ||
      fallbackArray(recipe.tags, lang).some((tag) =>
        tag.toLowerCase().includes(searchText.toLowerCase())
      );

    const matchesDifficulty =
      selectedDifficulty === '' || recipe.difficulty === selectedDifficulty;

    const matchesIngredient =
      ingredientFilter === '' ||
      fallbackArray(recipe.ingredients, lang).some((ing) =>
        ing.toLowerCase().includes(ingredientFilter.toLowerCase())
      );

    const matchesTag =
      selectedTag === '' ||
      fallbackArray(recipe.tags, lang).includes(selectedTag);

    return matchesSearch && matchesDifficulty && matchesIngredient && matchesTag;
  });

  /* ====== 按分类分组 ====== */
  const groupedRecipes = {};
  CATEGORIES.forEach((cat) => {
    const recipesInCategory = filteredRecipes.filter(
      (r) => r.category === cat.id
    );
    if (recipesInCategory.length > 0) {
      groupedRecipes[cat.id] = recipesInCategory;
    }
  });

  /* ====== 分类菜谱计数 ====== */
  const recipeCounts = {};
  CATEGORIES.forEach((cat) => {
    recipeCounts[cat.id] = recipes.filter(
      (r) => r.category === cat.id
    ).length;
  });

  /* ====== 滚动到分类 ====== */
  const handleCategoryClick = useCallback((categoryId) => {
    const targetEl = categoryRefs.current[categoryId];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setActiveCategoryId(categoryId);
  }, []);

  /* ====== 滚动监听 ====== */
  useEffect(() => {
    const handleScroll = () => {
      const categoryIds = Object.keys(groupedRecipes);
      let currentCategory = categoryIds[0] || '';

      for (const catId of categoryIds) {
        const el = categoryRefs.current[catId];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200) {
            currentCategory = catId;
          }
        }
      }
      setActiveCategoryId(currentCategory);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [groupedRecipes]);

  /* ====== 展开/收起详情 ====== */
  const toggleRecipeDetail = (recipeId) => {
    setExpandedRecipeId(expandedRecipeId === recipeId ? null : recipeId);
  };

  /* ====== 语言切换 ====== */
  const toggleLang = () => setLang(lang === 'zh' ? 'en' : 'zh');

  /* ====== 管理功能：保存菜谱 ====== */
  const handleSaveRecipe = async (formData, imageFile) => {
    setIsSaving(true);
    try {
      let updatedRecipe = { ...formData };

      // 如果有新图片，先上传
      if (imageFile) {
        // 用菜谱 ID + 文件扩展名作为文件名
        const ext = imageFile.name.split('.').pop();
        /* split('.').pop() 取最后一个 . 后面的部分，
           比如 "photo.jpg" → "jpg" */
        const fileName = `${formData.id}.${ext}`;

        await uploadImage(imageFile, fileName, authToken);
        updatedRecipe.image = fileName;
      }

      // 更新菜谱列表
      let newRecipes;
      const existingIndex = recipes.findIndex((r) => r.id === formData.id);
      /*
        findIndex 在数组中查找第一个满足条件的元素的索引。
        如果找到（>= 0），说明是编辑已有菜谱；
        如果找不到（-1），说明是新增。
      */

      if (existingIndex >= 0) {
        // 编辑模式：替换原来的菜谱
        newRecipes = [...recipes];
        /* [...recipes] 展开运算符创建数组的浅拷贝，
           不直接修改原数组（React 的不可变数据原则） */
        newRecipes[existingIndex] = updatedRecipe;
      } else {
        // 新增模式：追加到末尾
        newRecipes = [...recipes, updatedRecipe];
      }

      // 保存到 GitHub
      await saveRecipes(newRecipes, authToken);

      // 更新本地状态
      setRecipes(newRecipes);
      setShowForm(false);
      setEditingRecipe(null);
    } catch (error) {
      console.error('Save failed:', error);
      alert(
        lang === 'zh'
          ? `保存失败：${error.message}`
          : `Save failed: ${error.message}`
      );
    }
    setIsSaving(false);
  };

  /* ====== 管理功能：删除菜谱 ====== */
  const handleDeleteRecipe = async (recipe) => {
    const confirmMsg = t('confirmDelete', lang);
    if (!window.confirm(confirmMsg)) return;
    /* window.confirm 弹出浏览器原生确认对话框，
       用户点"确定"返回 true，点"取消"返回 false */

    try {
      // 如果有图片，先删图片
      if (recipe.image) {
        await deleteImage(recipe.image, authToken);
      }

      // 从列表中移除
      const newRecipes = recipes.filter((r) => r.id !== recipe.id);
      /* filter 返回一个新数组，只保留 id 不等于要删除的那个的菜谱 */

      // 保存到 GitHub
      await saveRecipes(newRecipes, authToken);

      // 更新本地状态
      setRecipes(newRecipes);
      // 如果正好展开着这道菜的详情，收起来
      if (expandedRecipeId === recipe.id) {
        setExpandedRecipeId(null);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert(
        lang === 'zh'
          ? `删除失败：${error.message}`
          : `Delete failed: ${error.message}`
      );
    }
  };

  /* ====== 点击编辑按钮 ====== */
  const handleEditClick = (recipe) => {
    setEditingRecipe(recipe);
    setShowForm(true);
  };

  /* ====== 点击新增按钮 ====== */
  const handleAddClick = () => {
    setEditingRecipe(null);
    setShowForm(true);
  };

  /* ====== 渲染 ====== */
  return (
    <div className="app">
      <Header
        lang={lang}
        onToggleLang={toggleLang}
        isAdmin={isAdmin}
        onLoginClick={initiateLogin}
        onLogout={() => {
          setIsAdmin(false);
          setAuthToken(null);
          setAdminUsername('');
        }}
        totalRecipes={recipes.length}
        onMobileMenuClick={() => setIsMobileMenuOpen(true)}
      />

      <FilterBar
        lang={lang}
        searchText={searchText}
        onSearchChange={setSearchText}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={setSelectedDifficulty}
        ingredientFilter={ingredientFilter}
        onIngredientChange={setIngredientFilter}
        allTags={allTags}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
      />

      <div className="main-layout">
        <Sidebar
          lang={lang}
          activeCategoryId={activeCategoryId}
          recipeCounts={recipeCounts}
          onCategoryClick={handleCategoryClick}
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
        />

        <main className="recipe-content" ref={contentRef}>
          {/* 管理员：新增按钮 */}
          {isAdmin && (
            <div className="admin-bar">
              <span className="admin-welcome">
                👨‍🍳 {lang === 'zh' ? `欢迎，${adminUsername}` : `Welcome, ${adminUsername}`}
              </span>
              <button className="admin-add-btn" onClick={handleAddClick}>
                {t('addRecipe', lang)}
              </button>
            </div>
          )}

          {/* 加载中 */}
          {isLoading ? (
            <div className="loading-state">
              <span className="loading-emoji">🍳</span>
              <p>{t('loading', lang)}</p>
            </div>
          ) : Object.keys(groupedRecipes).length === 0 ? (
            <div className="no-results">
              <span className="no-results-emoji">😅</span>
              <p>{t('noResults', lang)}</p>
            </div>
          ) : (
            Object.entries(groupedRecipes).map(([categoryId, categoryRecipes]) => {
              const category = CATEGORIES.find((c) => c.id === categoryId);

              return (
                <section
                  key={categoryId}
                  className="category-section"
                  ref={(el) => { categoryRefs.current[categoryId] = el; }}
                >
                  <h2 className="category-title">
                    <span className="category-emoji">{category.emoji}</span>
                    <span className="category-name">
                      {lang === 'zh' ? category.zh : category.en}
                    </span>
                    <span className="category-count">
                      ({categoryRecipes.length})
                    </span>
                  </h2>

                  <div className="category-recipes">
                    {categoryRecipes.map((recipe) => (
                      <div
                        key={recipe.id}
                        id={`recipe-${recipe.id}`}
                        className={`recipe-card ${expandedRecipeId === recipe.id ? 'expanded' : ''}`}
                      >
                        <div
                          className="recipe-card-main"
                          onClick={() => toggleRecipeDetail(recipe.id)}
                        >
                          <div className="recipe-card-image">
                            <img
                              src={recipe.image ? getImageUrl(recipe.image) : `${process.env.PUBLIC_URL}/images/default-dish.jpg`}
                              alt={recipe.nameZh}
                              className="recipe-img"
                              onError={(e) => {
                                e.target.src = `${process.env.PUBLIC_URL}/images/default-dish.jpg`;
                                /*
                                  onError: 图片加载失败时触发（比如 GitHub 上还没上传这张图）。
                                  把 src 替换成默认占位图，避免显示碎图标。
                                  e.target 就是这个 <img> 元素本身。
                                */
                              }}
                            />
                          </div>

                          <div className="recipe-card-info">
                            <h3 className="recipe-name">
                              {fallbackName(recipe, lang)}
                              <span className="recipe-name-sub">
                                {fallbackSubName(recipe, lang)}
                              </span>
                            </h3>
                            <div className="recipe-meta">
                              <span className={`tag tag-difficulty tag-${recipe.difficulty}`}>
                                {DIFFICULTIES.find((d) => d.id === recipe.difficulty)?.emoji}{' '}
                                {lang === 'zh'
                                  ? DIFFICULTIES.find((d) => d.id === recipe.difficulty)?.zh
                                  : DIFFICULTIES.find((d) => d.id === recipe.difficulty)?.en}
                              </span>
                              {fallbackArray(recipe.tags, lang).map((tag, i) => (
                                <span key={i} className="tag tag-custom">{tag}</span>
                              ))}
                            </div>
                          </div>

                          {/* 管理员：编辑/删除按钮 */}
                          {isAdmin && (
                            <div
                              className="admin-actions"
                              onClick={(e) => e.stopPropagation()}
                              /* stopPropagation 阻止点击事件冒泡到父元素，
                                 不然点编辑/删除按钮会同时触发卡片的展开/收起 */
                            >
                              <button
                                className="admin-btn admin-edit-btn"
                                onClick={() => handleEditClick(recipe)}
                              >
                                ✏️
                              </button>
                              <button
                                className="admin-btn admin-delete-btn"
                                onClick={() => handleDeleteRecipe(recipe)}
                              >
                                🗑️
                              </button>
                            </div>
                          )}

                          <span className={`recipe-card-arrow ${
                            expandedRecipeId === recipe.id ? 'rotated' : ''
                          }`}>
                            ▼
                          </span>
                        </div>

                        {expandedRecipeId === recipe.id && (
                          <div className="recipe-detail">
                            <div className="detail-section">
                              <h4 className="detail-title">
                                🥘 {t('ingredients', lang)}
                              </h4>
                              <ul className="ingredient-list">
                                {fallbackArray(recipe.ingredients, lang).map((ing, i) => (
                                  <li key={i}>{ing}</li>
                                ))}
                              </ul>
                            </div>

                            {fallbackArray(recipe.steps, lang).length > 0 && (
                              <div className="detail-section">
                                <h4 className="detail-title">
                                  👩‍🍳 {t('steps', lang)}
                                </h4>
                                <ol className="step-list">
                                  {fallbackArray(recipe.steps, lang).map((step, i) => (
                                    <li key={i}>{step}</li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            {fallback(recipe.tips, lang) && (
                              <div className="detail-section detail-tips">
                                <h4 className="detail-title">
                                  {t('tips', lang)}
                                </h4>
                                <p>{fallback(recipe.tips, lang)}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })
          )}

          <footer className="app-footer">
            <p>Made with ❤️ and a lot of garlic 🧄</p>
          </footer>
        </main>
      </div>

      {/* 菜谱表单弹窗 */}
      <AiRecommend recipes={recipes} lang={lang} />
      {showForm && (
        <RecipeForm
          lang={lang}
          recipe={editingRecipe}
          onSave={handleSaveRecipe}
          onCancel={() => {
            setShowForm(false);
            setEditingRecipe(null);
          }}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}

export default App;