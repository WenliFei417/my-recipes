/* ============================================
   RecipeForm 组件 - 新增/编辑菜谱的弹窗表单
   
   功能：
   - 新增模式：所有字段为空，填写后保存
   - 编辑模式：预填现有数据，修改后保存
   - 支持上传图片
   - 所有文字字段都有中英文两栏
   ============================================ */

import React, { useState, useEffect } from 'react';
import './RecipeForm.css';
import { CATEGORIES, DIFFICULTIES } from '../../data/sampleRecipes';
import { t } from '../../utils/i18n';

/*
  props 说明：
  - lang: 当前语言
  - recipe: 要编辑的菜谱对象（新增时为 null）
  - onSave: 保存时的回调，传入表单数据和图片文件
  - onCancel: 取消时的回调
  - isSaving: 是否正在保存中（显示加载状态）
*/
function RecipeForm({ lang, recipe, onSave, onCancel, isSaving }) {

  /* ====== 表单状态 ======
     每个字段都用 useState 管理。
     如果是编辑模式（recipe 不为 null），用现有数据初始化；
     如果是新增模式，用空值初始化。
  */
  const [nameZh, setNameZh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState('veggie');
  const [difficulty, setDifficulty] = useState('easy');
  const [ingredientsZh, setIngredientsZh] = useState('');
  const [ingredientsEn, setIngredientsEn] = useState('');
  const [stepsZh, setStepsZh] = useState('');
  const [stepsEn, setStepsEn] = useState('');
  const [tagsZh, setTagsZh] = useState('');
  const [tagsEn, setTagsEn] = useState('');
  const [tipsZh, setTipsZh] = useState('');
  const [tipsEn, setTipsEn] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  /* ====== 编辑模式：预填数据 ======
     useEffect 在 recipe 变化时执行，
     把现有菜谱的数据填入表单。
  */
  useEffect(() => {
    if (recipe) {
      setNameZh(recipe.nameZh || '');
      setNameEn(recipe.nameEn || '');
      setCategory(recipe.category || 'veggie');
      setDifficulty(recipe.difficulty || 'easy');
      // 数组用换行符连接成字符串，方便在 textarea 里编辑
      setIngredientsZh((recipe.ingredients?.zh || []).join('\n'));
      setIngredientsEn((recipe.ingredients?.en || []).join('\n'));
      setStepsZh((recipe.steps?.zh || []).join('\n'));
      setStepsEn((recipe.steps?.en || []).join('\n'));
      // 标签用逗号连接
      setTagsZh((recipe.tags?.zh || []).join(', '));
      setTagsEn((recipe.tags?.en || []).join(', '));
      setTipsZh(recipe.tips?.zh || '');
      setTipsEn(recipe.tips?.en || '');
    }
  }, [recipe]);

  /* ====== 图片选择处理 ====== */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    /* e.target.files 是用户选择的文件列表，
       我们只要第一个文件（单选） */
    if (file) {
      setImageFile(file);
      // 创建本地预览 URL
      setImagePreview(URL.createObjectURL(file));
      /* URL.createObjectURL 创建一个临时 URL 指向用户选的本地文件，
         可以直接放到 <img src> 里预览，不需要上传到服务器 */
    }
  };

  /* ====== 提交表单 ====== */
  const handleSubmit = (e) => {
    e.preventDefault();
    /* e.preventDefault() 阻止表单的默认提交行为（刷新页面），
       我们要自己控制提交逻辑 */

    // 基础验证
    if (!nameZh.trim() || !nameEn.trim()) {
      alert(lang === 'zh' ? '菜名不能为空哦！' : 'Recipe name is required!');
      return;
    }

    // 把表单数据组装成菜谱对象
    const formData = {
      // 如果是编辑模式用原来的 ID，新增则根据英文名生成 ID
      id: recipe?.id || nameEn.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      /*
        生成 ID 的逻辑：
        1. 转小写
        2. 空格替换成短横线
        3. 去掉不是字母、数字、短横线的字符
        比如 "Mapo Tofu" → "mapo-tofu"
      */
      nameZh: nameZh.trim(),
      nameEn: nameEn.trim(),
      category,
      difficulty,
      ingredients: {
        // 按换行符分割成数组，过滤掉空行
        zh: ingredientsZh.split('\n').map((s) => s.trim()).filter(Boolean),
        en: ingredientsEn.split('\n').map((s) => s.trim()).filter(Boolean),
      },
      steps: {
        zh: stepsZh.split('\n').map((s) => s.trim()).filter(Boolean),
        en: stepsEn.split('\n').map((s) => s.trim()).filter(Boolean),
      },
      tags: {
        // 按逗号分割
        zh: tagsZh.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
        /* 正则 /[,，]/ 同时匹配英文逗号和中文逗号，
           这样用户不管用哪种逗号都能正确分割 */
        en: tagsEn.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
      },
      tips: {
        zh: tipsZh.trim(),
        en: tipsEn.trim(),
      },
      // 保留原来的图片文件名（如果有）
      image: recipe?.image || '',
    };

    onSave(formData, imageFile);
  };

  return (
    /* 遮罩层 + 弹窗 */
    <div className="form-overlay">
      <div className="form-modal">
        {/* 弹窗标题 */}
        <div className="form-header">
          <h2>
            {recipe
              ? (lang === 'zh' ? '✏️ 编辑菜谱' : '✏️ Edit Recipe')
              : (lang === 'zh' ? '✨ 添加新菜谱' : '✨ Add New Recipe')}
          </h2>
          <button className="form-close-btn" onClick={onCancel}>✕</button>
        </div>

        {/* 表单内容（可滚动） */}
        <div className="form-body" onSubmit={handleSubmit}>
          {/* --- 菜名（中英文并排） --- */}
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">{t('formNameZh', lang)} *</label>
              <input
                type="text"
                className="form-input"
                value={nameZh}
                onChange={(e) => setNameZh(e.target.value)}
                placeholder="例：麻婆豆腐"
              />
            </div>
            <div className="form-field">
              <label className="form-label">{t('formNameEn', lang)} *</label>
              <input
                type="text"
                className="form-input"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Mapo Tofu"
              />
            </div>
          </div>

          {/* --- 分类和难度 --- */}
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">{t('formCategory', lang)}</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {lang === 'zh' ? cat.zh : cat.en}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">{t('formDifficulty', lang)}</label>
              <select
                className="form-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                {DIFFICULTIES.map((diff) => (
                  <option key={diff.id} value={diff.id}>
                    {diff.emoji} {lang === 'zh' ? diff.zh : diff.en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* --- 食材（中英文并排） --- */}
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">{t('formIngredients', lang)} (中文)</label>
              <textarea
                className="form-textarea"
                rows={5}
                value={ingredientsZh}
                onChange={(e) => setIngredientsZh(e.target.value)}
                placeholder={'嫩豆腐 1盒\n猪肉末 100g\n郫县豆瓣酱 2勺'}
              />
            </div>
            <div className="form-field">
              <label className="form-label">{t('formIngredients', lang)} (EN)</label>
              <textarea
                className="form-textarea"
                rows={5}
                value={ingredientsEn}
                onChange={(e) => setIngredientsEn(e.target.value)}
                placeholder={'1 box soft tofu\n100g ground pork\n2 tbsp doubanjiang'}
              />
            </div>
          </div>

          {/* --- 步骤（中英文并排） --- */}
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">{t('formSteps', lang)} (中文)</label>
              <textarea
                className="form-textarea"
                rows={6}
                value={stepsZh}
                onChange={(e) => setStepsZh(e.target.value)}
                placeholder={'豆腐切块焯水\n热锅冷油炒肉末\n...'}
              />
            </div>
            <div className="form-field">
              <label className="form-label">{t('formSteps', lang)} (EN)</label>
              <textarea
                className="form-textarea"
                rows={6}
                value={stepsEn}
                onChange={(e) => setStepsEn(e.target.value)}
                placeholder={'Cut tofu into cubes\nHeat oil and stir-fry pork\n...'}
              />
            </div>
          </div>

          {/* --- 标签（中英文并排） --- */}
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">{t('formTags', lang)} (中文)</label>
              <input
                type="text"
                className="form-input"
                value={tagsZh}
                onChange={(e) => setTagsZh(e.target.value)}
                placeholder="小孩最爱, 下饭神器"
              />
            </div>
            <div className="form-field">
              <label className="form-label">{t('formTags', lang)} (EN)</label>
              <input
                type="text"
                className="form-input"
                value={tagsEn}
                onChange={(e) => setTagsEn(e.target.value)}
                placeholder="Kids favorite, Perfect with rice"
              />
            </div>
          </div>

          {/* --- 小贴士（中英文并排） --- */}
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">{t('formTips', lang)} (中文)</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={tipsZh}
                onChange={(e) => setTipsZh(e.target.value)}
                placeholder="写点小窍门..."
              />
            </div>
            <div className="form-field">
              <label className="form-label">{t('formTips', lang)} (EN)</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={tipsEn}
                onChange={(e) => setTipsEn(e.target.value)}
                placeholder="Any cooking tips..."
              />
            </div>
          </div>

          {/* --- 图片上传 --- */}
          <div className="form-field">
            <label className="form-label">{t('formImage', lang)}</label>
            <div className="form-image-upload">
              <input
                type="file"
                accept="image/*"
                /* accept="image/*" 限制只能选择图片文件 */
                onChange={handleImageChange}
                id="image-upload"
                className="form-file-input"
              />
              <label htmlFor="image-upload" className="form-file-label">
                📷 {lang === 'zh' ? '选择图片' : 'Choose Image'}
              </label>
              {/* 图片预览 */}
              {(imagePreview || recipe?.image) && (
                <div className="form-image-preview">
                  <img
                    src={imagePreview || ''}
                    alt="preview"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="form-footer">
          <button
            className="form-btn form-btn-cancel"
            onClick={onCancel}
            disabled={isSaving}
          >
            {t('cancel', lang)}
          </button>
          <button
            className="form-btn form-btn-save"
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? t('saving', lang) : t('save', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecipeForm;