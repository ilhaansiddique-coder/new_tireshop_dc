# 🚀 Vercel Deployment Checklist

## Before You Deploy

- [ ] Repository pushed to GitHub: `ilhaansiddique-coder/new_tireshop_dc`
- [ ] `.env.local` is in `.gitignore` (NOT committed)
- [ ] `vercel.json` exists in project root
- [ ] `package.json` has build scripts
- [ ] `.env.example` documents all required variables

---

## Vercel Setup (5 minutes)

### 1. Create Vercel Account
- [ ] Go to https://vercel.com
- [ ] Sign up with GitHub (recommended)
- [ ] Grant access to `ilhaansiddique-coder` organization

### 2. Import Project
- [ ] Click "New Project"
- [ ] Import `new_tireshop_dc` repository
- [ ] Click "Import"

### 3. Configure Environment Variables
In **Settings → Environment Variables**, add:

```
BACKEND_API_URL        = https://your-actual-backend.com
REACT_APP_EONTYRE_API_KEY = YOUR_EONTYRE_API_KEY
REACT_APP_DEFAULT_LANG = sv
```

- [ ] `BACKEND_API_URL` set (NOT localhost!)
- [ ] `REACT_APP_EONTYRE_API_KEY` set securely
- [ ] `REACT_APP_DEFAULT_LANG` set to `sv`

### 4. Deploy
- [ ] Click "Deploy"
- [ ] Wait for build ✅
- [ ] Get your live URL

---

## Post-Deployment (Testing)

- [ ] Visit your Vercel URL
- [ ] Check console for errors: F12
- [ ] Click EN button → Verify language changes
- [ ] Click SV button → Verify language changes back
- [ ] Refresh page → Language persists ✓
- [ ] Open Network tab → Check API calls
- [ ] Run in console: `window.DC_LANG.current` → Should return 'sv' or 'en'

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Blank page | Check vercel.json is correct |
| API calls fail | Update BACKEND_API_URL to real URL |
| API key undefined | Ensure REACT_APP_EONTYRE_API_KEY is set |
| Language not changing | Check console for JS errors |
| 404 errors | Verify .html files are in root |

---

## Quick Commands

**View live site:**
```
https://new-tireshop-dc.vercel.app
```

**Redeploy:**
1. Push changes to GitHub
2. Vercel auto-deploys (no action needed)

**Update environment variables:**
1. Vercel Dashboard → Settings → Environment Variables
2. Update value
3. Click "Redeploy"

**View logs:**
Vercel Dashboard → Deployments → Click deployment → Logs

---

## Security Checklist

- [ ] API key is NOT in `.env.local` that's committed
- [ ] API key IS in Vercel Environment Variables
- [ ] `.env.local` is in `.gitignore`
- [ ] GitHub repo doesn't show any secrets
- [ ] Only `REACT_APP_*` variables are public

---

## Success Indicators ✅

- [ ] Site loads without errors
- [ ] Language switcher works (EN/SV)
- [ ] No red errors in console
- [ ] API calls complete successfully
- [ ] Page refresh keeps language preference

---

## Next Steps

1. **Monitor Performance:** Vercel Analytics
2. **Set Custom Domain:** `tireshop.yourcompany.com`
3. **Enable Preview Deployments:** For pull requests
4. **Set up automatic deploys:** Already enabled

---

**Deploy Status:** Ready to deploy! 🚀
