/* ============================================
   AiRecommend 组件 - AI 智能菜谱推荐
   
   功能：
   1. 右下角浮动按钮，点击弹出推荐面板
   2. 用户输入需求（或点快捷标签）
   3. 调用 /api/recommend 获取 AI 推荐
   4. 点击推荐结果，滚动到对应菜谱卡片并高亮
   ============================================ */

import React, { useState } from 'react';
import { getAiRecommendation } from '../../utils/recommend';
import { getImageUrl } from '../../utils/github';
import './AiRecommend.css';

function AiRecommend({ recipes, lang }) {
  /* ====== 状态 ====== */
  const [isOpen, setIsOpen] = useState(false);     // 面板开关
  const [query, setQuery] = useState('');           // 用户输入
  const [loading, setLoading] = useState(false);    // 加载状态
  const [result, setResult] = useState(null);       // 推荐结果
  const [error, setError] = useState('');           // 错误信息
  const [cooldown, setCooldown] = useState(false);  // 冷却时间（防滥用）

  const isZh = lang === 'zh';

  /* ====== 快捷标签 ====== */
  const quickTags = isZh
    ? ['想吃辣的', '简单快手菜', '来道下饭菜', '有什么甜品？']
    : ['Something spicy', 'Quick & easy', 'Comfort food', 'Any desserts?'];

  /* ====== 提交推荐请求 ====== */
  const handleSubmit = async () => {
    if (!query.trim() || loading || cooldown) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await getAiRecommendation(query, recipes, lang);
      setResult(data);
    } catch (err) {
      setError(isZh ? '推荐服务暂时不可用，请稍后再试' : 'Service temporarily unavailable, please try again');
    } finally {
      setLoading(false);

      // 冷却 10 秒，防止频繁请求
      setCooldown(true);
      setTimeout(() => setCooldown(false), 10000);
    }
  };

  /* ====== 键盘事件：Enter 提交 ====== */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  /* ====== 点击推荐结果：滚动到对应菜谱卡片 ====== */
  const handleClickRecommendation = (recipeId) => {
    // 关闭面板
    setIsOpen(false);

    // 找到对应的菜谱卡片 DOM 元素
    const card = document.getElementById(`recipe-${recipeId}`);
    if (card) {
      // 平滑滚动到卡片位置
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // 添加高亮动画，2 秒后移除
      card.classList.add('ai-highlighted');
      setTimeout(() => {
        card.classList.remove('ai-highlighted');
      }, 2000);
    }
  };

  /* ====== 渲染 ====== */
  return (
    <>
      {/* 浮动按钮 */}
      <button
        className="ai-fab"
        onClick={() => setIsOpen(!isOpen)}
        title={isZh ? 'AI 推荐' : 'AI Recommend'}
      >
        {isOpen ? '✕' : '✨'}
      </button>

      {/* 推荐面板 */}
      {isOpen && (
        <div className="ai-panel">
          {/* 头部 */}
          <div className="ai-panel-header">
            <h3>{isZh ? '✨ AI 智能推荐' : '✨ AI Recommend'}</h3>
            <p className="ai-subtitle">
              {isZh
                ? '告诉我你想吃什么，我来帮你挑'
                : 'Tell me what you feel like eating'}
            </p>
          </div>

          {/* 快捷标签 */}
          <div className="ai-quick-tags">
            {quickTags.map((tag, i) => (
              <button
                key={i}
                className="ai-tag"
                onClick={() => setQuery(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* 输入区域 */}
          <div className="ai-input-area">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isZh ? '例如：今天想吃点清淡的...' : 'e.g. Something light today...'}
              disabled={loading}
              maxLength={200}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !query.trim() || cooldown}
              className="ai-send-btn"
            >
              {loading
                ? (isZh ? '想想...' : '...')
                : cooldown
                  ? (isZh ? '稍等' : 'Wait')
                  : (isZh ? '推荐' : 'Go')}
            </button>
          </div>

          {/* 错误提示 */}
          {error && <div className="ai-error">{error}</div>}

          {/* 推荐结果 */}
          {result && (
            <div className="ai-results">
              {/* AI 的友好回复 */}
              {result.message && (
                <p className="ai-message">{result.message}</p>
              )}

              {/* 推荐卡片列表 */}
              {result.recommendations?.length > 0 && (
                <div className="ai-recommendations">
                  {result.recommendations.map((rec, index) => {
                    // 用推荐的 id 去完整菜谱列表里找到对应菜谱（取图片等信息）
                    const recipe = recipes.find((r) => r.id === rec.id);

                    return (
                      <div
                        key={rec.id || index}
                        className="ai-rec-card"
                        onClick={() => handleClickRecommendation(rec.id)}
                      >
                        {/* 缩略图 */}
                        {recipe?.image && (
                          <img
                            src={getImageUrl(recipe.image)}
                            alt={rec.name}
                            className="ai-rec-img"
                            onError={(e) => {
                              e.target.src = `${process.env.PUBLIC_URL}/images/default-dish.jpg`;
                            }}
                          />
                        )}
                        {/* 菜名 + 推荐理由 */}
                        <div className="ai-rec-info">
                          <h4>{rec.name}</h4>
                          <p className="ai-rec-reason">{rec.reason}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default AiRecommend;
