# 🚀 Quick Start Checklist

Get Prompt Pal published in 30 minutes!

## ✅ Step 1: Push to GitHub (5 min)

```bash
# 1. Create repo on GitHub
# Go to: https://github.com/new
# Name: prompt-pal
# Make it Public
# DON'T initialize with README

# 2. Push your code
cd prompt-usage-analytics
git remote add origin https://github.com/YOUR_USERNAME/prompt-pal.git
git branch -M main
git push -u origin main

# 3. Verify
# Visit: https://github.com/YOUR_USERNAME/prompt-pal
```

## ✅ Step 2: Deploy Landing Page (5 min)

```bash
# Move landing page to root
git mv landing-page/index.html .

# Update GitHub username in index.html
# Find and replace: yourusername → YOUR_ACTUAL_USERNAME

git add -A
git commit -m "Deploy landing page"
git push
```

Then:
1. Go to: https://github.com/YOUR_USERNAME/prompt-pal/settings/pages
2. Source: Deploy from a branch
3. Branch: main / (root)
4. Click Save
5. Wait 2-3 minutes
6. Visit: https://YOUR_USERNAME.github.io/prompt-pal

## ✅ Step 3: Prepare Chrome Web Store (10 min)

### A. Create package
```bash
# Create ZIP file
cd prompt-usage-analytics
zip -r prompt-pal-v1.0.0.zip \
  manifest.json \
  background.js \
  popup.html \
  popup.js \
  popup.css \
  icons/ \
  -x "*.git*" -x "landing-page/*" -x "*.md" -x "docs/*" -x "LICENSE"

# On Windows: manually select these files and zip them
```

### B. Create privacy policy

Create `PRIVACY.md` in your repo:

```markdown
# Privacy Policy

Prompt Pal stores all data locally on your device.
We do not collect, transmit, or share any data.

Last updated: 2025
```

Commit and push it - it'll be at:
`https://YOUR_USERNAME.github.io/prompt-pal/PRIVACY.md`

### C. Take screenshots

1. Load extension in Chrome (chrome://extensions → Developer mode → Load unpacked)
2. Visit ChatGPT, send a prompt
3. Open extension popup
4. Take screenshots at 1280x800:
   - Screenshot 1: Main dashboard with prompts
   - Screenshot 2: Sorted/filtered view
   - Screenshot 3: Export dialog

Save them as PNG files.

## ✅ Step 4: Submit to Chrome Web Store (10 min)

1. Go to: https://chrome.google.com/webstore/devconsole
2. Pay $5 developer fee (one-time)
3. Click "New Item"
4. Upload: `prompt-pal-v1.0.0.zip`
5. Fill in:
   - **Name:** Prompt Pal - LLM Analytics
   - **Category:** Productivity
   - **Description:** (copy from README or write your own)
   - **Privacy Policy:** Your GitHub Pages URL + /PRIVACY.md
6. Upload screenshots (1280x800 PNG)
7. Add icons (already in package)
8. Click "Submit for review"

Wait 1-3 days for approval!

## ✅ Step 5: Celebrate! 🎉

Once approved:
1. Update landing page with real Chrome Web Store link
2. Post on social media
3. Submit to Product Hunt
4. Share with friends!

---

## 🆘 Need Help?

- **Full Guide:** See [PUBLISHING.md](./PUBLISHING.md)
- **GitHub Issues:** Open an issue on your repo
- **Chrome Web Store Help:** https://developer.chrome.com/docs/webstore/

Good luck! 🚀
