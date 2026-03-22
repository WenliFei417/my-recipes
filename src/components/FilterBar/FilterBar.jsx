/* ============================================
   FilterBar 组件 - 横向筛选栏
   
   从左到右顺序：食材筛选 | 标签筛选 | 难度筛选 | 菜名搜索（小）
   ============================================ */

import React from 'react';
import './FilterBar.css';
import { DIFFICULTIES } from '../../data/sampleRecipes';
import { t } from '../../utils/i18n';

/*
  新增 props：
  - allTags: 当前所有菜谱中存在的标签列表（去重后的数组）
  - selectedTag: 当前选中的标签
  - onTagChange: 标签选择改变时的回调
*/
function FilterBar({
  lang,
  searchText,
  onSearchChange,
  selectedDifficulty,
  onDifficultyChange,
  ingredientFilter,
  onIngredientChange,
  allTags,
  selectedTag,
  onTagChange,
}) {
  return (
    <div className="filter-bar">
      {/* 1. 食材筛选 */}
      <div className="filter-item filter-ingredient">
        <span className="filter-icon">🥕</span>
        <input
          type="text"
          className="filter-input"
          placeholder={t('filterByIngredient', lang)}
          value={ingredientFilter}
          onChange={(e) => onIngredientChange(e.target.value)}
        />
        {ingredientFilter && (
          <button className="filter-clear-btn" onClick={() => onIngredientChange('')}>
            ✕
          </button>
        )}
      </div>

      {/* 2. 标签筛选 */}
      <div className="filter-item">
        <select
          className="filter-select"
          value={selectedTag}
          onChange={(e) => onTagChange(e.target.value)}
        >
          <option value="">
            {lang === 'zh' ? '全部标签' : 'All Tags'}
          </option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      {/* 3. 难度筛选 */}
      <div className="filter-item">
        <select
          className="filter-select"
          value={selectedDifficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
        >
          <option value="">{t('allDifficulties', lang)}</option>
          {DIFFICULTIES.map((diff) => (
            <option key={diff.id} value={diff.id}>
              {diff.emoji} {lang === 'zh' ? diff.zh : diff.en}
            </option>
          ))}
        </select>
      </div>

      {/* 4. 菜名搜索（小尺寸，靠右） */}
      <div className="filter-item filter-search">
        <span className="filter-icon">🔍</span>
        <input
          type="text"
          className="filter-input"
          placeholder={t('searchPlaceholder', lang)}
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchText && (
          <button className="filter-clear-btn" onClick={() => onSearchChange('')}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default FilterBar;