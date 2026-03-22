/* ============================================
   应用入口文件
   这是整个 React 应用的起点。
   浏览器打开页面时，最先执行的就是这个文件。
   ============================================ */

import React from 'react';
import ReactDOM from 'react-dom/client';

// 引入全局样式（我们刚才写的那个文件）
// 这行必须放在组件 import 之前，确保样式最先加载
import './styles/global.css';

import App from './App';

// React 18 的渲染方式：
// 1. 找到 public/index.html 里 id="root" 的那个 div
// 2. 把我们的 App 组件渲染到里面
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* StrictMode 是开发工具，帮你发现潜在问题，上线后不会影响性能 */}
    <App />
  </React.StrictMode>
);