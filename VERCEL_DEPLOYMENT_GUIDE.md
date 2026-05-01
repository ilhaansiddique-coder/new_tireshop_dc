# Vercel Deployment Guide

## Overview
This guide explains how to deploy the Däckcentrum project to Vercel without errors.

---

## Pre-Deployment Checklist ✅

- [ ] GitHub repository is connected
- [ ] `.env.local` is in `.gitignore` (never commit secrets)
- [ ] API key is NOT exposed in code
- [ ] `vercel.json` is configured
- [ ] `package.json` has proper scripts

---

## Step 1: Prepare Your Repository

Make sure `.env.local` is in `.gitignore`:
```
# In .gitignore
.env.local
.env
```

Your actual `.env.local` should NEVER be committed to GitHub.

---

## Step 2: Connect to Vercel

### Option A: Import from GitHub (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select "Import Git Repository"
4. Choose `ilhaansiddique-coder/new_tireshop_dc`
5. Click "Import"

### Option B: Deploy from CLI
```bash
npm install -g vercel
vercel login
vercel
```

---

## Step 3: Set Environment Variables in Vercel

**IMPORTANT:** Do NOT add API keys directly in Git. Add them in Vercel Dashboard instead.

### In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add these variables:

| Variable | Value | Where to Get |
|----------|-------|-------------|
| `BACKEND_API_URL` | `https://your-backend-domain.com` | Your actual backend server URL |
| `REACT_APP_EONTYRE_API_KEY` | `YOUR_EONTYRE_API_KEY` | From EONTYRE support |
| `REACT_APP_DEFAULT_LANG` | `sv` | Language preference (sv or en) |

### Example:
```
BACKEND_API_URL = https://api.eontyre.com
REACT_APP_EONTYRE_API_KEY = YOUR_EONTYRE_API_KEY
REACT_APP_DEFAULT_LANG = sv
```

---

## Step 4: Configure Build Settings (If Needed)

Vercel should auto-detect your setup, but you can verify:

**Settings → Build & Development Settings:**
- Build Command: `npm run build`
- Output Directory: `.` (root)
- Install Command: `npm install`

---

## Step 5: Deploy

After setting environment variables:

1. Click "Deploy" button in Vercel
2. Wait for build to complete
3. Your site will be live at: `https://new-tireshop-dc.vercel.app`

---

## Common Errors & Solutions

### ❌ Error: "BACKEND_API_URL is localhost"
**Solution:** Update `BACKEND_API_URL` environment variable in Vercel to your real backend URL.

### ❌ Error: "API Key is undefined"
**Solution:** Make sure `REACT_APP_EONTYRE_API_KEY` is set in Vercel environment variables.

### ❌ Error: "Cannot fetch from API"
**Solution:** Check if your backend is accessible and CORS is enabled:
```javascript
// In backend (example)
app.use(cors({
  origin: ['https://new-tireshop-dc.vercel.app'],
  credentials: true
}));
```

### ❌ Error: "HTML files not loading"
**Solution:** Vercel config is already set up in `vercel.json` to serve HTML files correctly.

---

## Customization After Deploy

### Change Backend URL
1. Vercel Dashboard → Settings → Environment Variables
2. Update `BACKEND_API_URL`
3. Redeploy

### Change API Key
1. Update in Vercel Environment Variables (NOT in code)
2. Redeploy

### Change Default Language
1. Update `REACT_APP_DEFAULT_LANG` in Vercel
2. Redeploy

---

## Health Check

After deployment, verify everything works:

1. ✅ Visit your Vercel URL
2. ✅ Check browser console (F12) for errors
3. ✅ Try switching language (EN/SV button)
4. ✅ Test API calls (open console and run):
   ```javascript
   window.DC_LANG.current // Should return 'sv' or 'en'
   ```

---

## Production Tips

1. **Monitor Performance:** Vercel Analytics → Performance
2. **Check Logs:** Deployments → View → Logs
3. **Enable Caching:** Already configured in `vercel.json`
4. **Set Custom Domain:** Domains → Add
5. **Enable HTTPS:** Automatic with Vercel

---

## Rollback Previous Deploy

If something breaks:

1. Vercel Dashboard → Deployments
2. Find the previous working deployment
3. Click "..." → "Promote to Production"

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Project Status:** https://vercel.com/your-dashboard
- **API Issues:** Check EONTYRE documentation

---

## Summary

✅ Environment variables secure (in Vercel, not in Git)
✅ Backend URL configured
✅ API key protected
✅ Static files serving correctly
✅ Ready for production!

Deploy and enjoy! 🚀
