# 🍽️ Dine with Wenli

**Personal Recipe Collection & Management Platform**

A bilingual (Chinese/English) personal recipe website where I showcase my home-cooked dishes. Visitors can explore recipes by category, difficulty, ingredients, and custom tags. As the admin, I can manage all recipes directly from the frontend — adding, editing, and deleting dishes with image uploads, all persisted to GitHub as a backend-free data store.

🔗 **Live Demo:** [wenli-recipes.vercel.app](https://wenli-recipes.vercel.app)

---

## ✨ Highlights

- **Serverless Architecture** — No traditional backend; GitHub serves as both database and image host
- **GitHub-as-Database** — Recipe data (JSON) and images stored directly in a GitHub repository via the Contents API
- **GitHub OAuth Admin System** — Secure admin login with GitHub OAuth; only the repo owner can manage recipes
- **Bilingual with Smart Fallback** — Full Chinese/English support with one-click switching; untranslated fields automatically fall back to the available language
- **Category Sidebar with Scroll Sync** — Left sidebar highlights the current category as the user scrolls
- **Responsive Mobile Layout** — Optimized for mobile with a floating category menu button and adaptive card sizes
- **Image Upload via GitHub API** — Upload recipe images directly from the browser, stored in the GitHub repo

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React |
| Styling | CSS3 (custom properties, responsive design) |
| Data Storage | GitHub API (Contents API) |
| Image Storage | GitHub Repository |
| Authentication | GitHub OAuth |
| Hosting | Vercel |
| Serverless Function | Vercel Serverless (OAuth token exchange) |

## 📁 Project Structure

```
├── api/
│   └── auth.js                 # Vercel Serverless Function (OAuth)
├── public/
│   └── images/                 # Static images
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   ├── FilterBar/
│   │   ├── Header/
│   │   ├── RecipeForm/
│   │   ├── RecipeList/
│   │   └── Sidebar/
│   ├── data/
│   ├── styles/
│   └── utils/
└── .env
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- A GitHub account
- Vercel CLI (`npm install -g vercel`)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/WenliFei417/my-recipes.git
   cd my-recipes
   npm install
   ```

2. **Create a data repository** on GitHub (e.g. `my-recipes-data`) with:
   - `data/recipes.json` (content: `[]`)
   - `images/.gitkeep`

3. **Register a GitHub OAuth App** at [github.com/settings/developers](https://github.com/settings/developers)

4. **Create `.env`** in the project root:
   ```
   REACT_APP_GITHUB_OWNER=your-github-username
   REACT_APP_GITHUB_REPO=my-recipes-data
   REACT_APP_GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   GITHUB_OWNER=your-github-username
   ```

5. **Run locally**
   ```bash
   vercel dev
   ```

### Deploy

1. Push code to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add the environment variables in Vercel project settings
4. Update your GitHub OAuth App's callback URL to your Vercel domain

## 📄 License

This project is for personal use. Feel free to reference the architecture for your own projects.