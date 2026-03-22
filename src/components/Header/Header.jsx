/* ============================================
   Header 组件 - 顶部标题栏（背景图片版）
   ============================================ */

import React from 'react';
import './Header.css';
import { t } from '../../utils/i18n';

function Header({
  lang,
  onToggleLang,
  isAdmin,
  onLoginClick,
  onLogout,
  totalRecipes,
  onMobileMenuClick,
}) {
  return (
    <header className="header" style={{
      '--header-bg': `url(${process.env.PUBLIC_URL}/images/header-bg.jpg)`
    }}>
      <div className="header-top">
        {/* 手机端汉堡菜单 */}
        <button className="header-menu-btn" onClick={onMobileMenuClick}>
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>

        {/* 标题 */}
        <div className="header-title-group">
          <h1 className="header-title">{t('siteTitle', lang)}</h1>
          <p className="header-slogan">{t('siteSlogan', lang)}</p>
        </div>

        {/* 右侧按钮 */}
        <div className="header-actions">
          <button className="header-btn lang-toggle" onClick={onToggleLang}>
            {lang === 'zh' ? '🌐 English' : '🌐 中文'}
          </button>
          {isAdmin ? (
            <button className="header-btn logout-btn" onClick={onLogout}>
              {t('logout', lang)}
            </button>
          ) : (
            <button className="header-btn login-btn" onClick={onLoginClick}>
              {t('login', lang)}
            </button>
          )}
        </div>
      </div>

      <div className="header-recipe-count">
        {lang === 'zh'
          ? '看看菜单，挑点喜欢的，今晚一起好好吃一顿吧'
          : "Browse the menu, pick what you like, and let's make tonight delicious"}
      </div>
    </header>
  );
}

export default Header;