/* ============================================
   Sidebar 组件 - 左侧分类导航栏
   
   功能：
   1. 显示 9 个菜谱分类，点击后右侧滚动到对应区域
   2. 高亮当前可见的分类（滚动时自动更新）
   3. 显示每个分类下有多少道菜
   4. 手机端变成可以弹出/收起的抽屉菜单
   ============================================ */

import React from 'react';
import './Sidebar.css';
import { CATEGORIES } from '../../data/sampleRecipes';

/*
  组件参数（props）说明：
  - lang: 当前语言 ('zh' 或 'en')
  - activeCategoryId: 当前高亮的分类 ID（滚动到哪个分类就高亮哪个）
  - recipeCounts: 一个对象，记录每个分类下有多少道菜，如 { veggie: 3, meat: 5, ... }
  - onCategoryClick: 点击分类时的回调函数，传入分类 ID
  - isMobileOpen: 手机端侧边栏是否打开（true/false）
  - onMobileClose: 手机端关闭侧边栏的回调函数
*/
function Sidebar({
  lang,
  activeCategoryId,
  recipeCounts,
  onCategoryClick,
  isMobileOpen,
  onMobileClose,
}) {

  // 点击某个分类
  const handleCategoryClick = (categoryId) => {
    onCategoryClick(categoryId);
    // 如果是手机端，点击后自动关闭抽屉
    if (isMobileOpen) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* 
        手机端遮罩层：
        点击侧边栏以外的区域（黑色半透明背景）时关闭抽屉。
        桌面端不显示（CSS 里控制）。
      */}
      {isMobileOpen && (
        <div className="sidebar-overlay" onClick={onMobileClose} />
      )}

      {/* 
        侧边栏主体
        className 根据 isMobileOpen 动态添加 'open' 类，
        CSS 里通过这个类控制手机端的滑入/滑出动画。
        
        模板字符串写法：`sidebar ${条件 ? '加这个类' : ''}`
        比如 isMobileOpen 为 true 时，className 就是 "sidebar open"
      */}
      <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
        
        {/* 手机端顶部：标题 + 关闭按钮 */}
        <div className="sidebar-mobile-header">
          <span className="sidebar-mobile-title">
            {lang === 'zh' ? '菜谱分类' : 'Categories'}
          </span>
          <button className="sidebar-close-btn" onClick={onMobileClose}>
            ✕
          </button>
        </div>

        {/* 分类列表 */}
        <nav className="sidebar-nav">
          {CATEGORIES.map((category) => {
            // 判断这个分类是否是当前高亮的
            const isActive = activeCategoryId === category.id;
            // 获取这个分类下的菜谱数量，如果没有就显示 0
            const count = recipeCounts[category.id] || 0;

            return (
              <button
                key={category.id}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category.id)}
              >
                {/* 左侧：emoji + 分类名 */}
                <span className="sidebar-item-label">
                  <span className="sidebar-item-emoji">{category.emoji}</span>
                  <span className="sidebar-item-text">
                    {lang === 'zh' ? category.zh : category.en}
                  </span>
                </span>

                {/* 右侧：菜谱数量角标 */}
                {count > 0 && (
                  <span className="sidebar-item-count">{count}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 底部装饰文字 */}
        <div className="sidebar-footer">
          {lang === 'zh' ? '🍴 开饭啦' : '🍴 Bon appétit'}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;