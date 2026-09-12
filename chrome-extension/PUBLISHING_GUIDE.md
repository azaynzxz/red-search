# Chrome Web Store Publishing Guide

This guide will walk you through publishing the Search Portal extension to the Chrome Web Store.

## Prerequisites

1. **Google Account**: You need a Google account
2. **Developer Fee**: One-time $5 registration fee
3. **Required Assets**: Icons, screenshots, promotional images

## Step 1: Prepare Required Assets

### Icons (Required)
Create three icon sizes in the `icons/` folder:
- `icon16.png` - 16x16px (for extension menu)
- `icon48.png` - 48x48px (for extension management page)
- `icon128.png` - 128x128px (for Chrome Web Store)

**Design Tips**:
- Use a simple, recognizable symbol (e.g., search icon, portal icon)
- Ensure good contrast and visibility at small sizes
- PNG format with transparency
- Match your app's color scheme (dark red/maroon theme)

### Screenshots (Required - at least 1)
Capture screenshots of your extension in action:
- **Size**: 1280x800 or 640x400 pixels
- **Format**: PNG or JPEG
- **Quantity**: 1-5 screenshots recommended

**Suggested Screenshots**:
1. Main view with search bar and clock
2. Widgets panel open (showing to-do, notes, calculator)
3. Pinned apps in dock
4. Focus mode active
5. Screensaver mode

### Promotional Images (Optional but Recommended)

#### Small Promotional Tile (Required for featured placement)
- **Size**: 440x280 pixels
- **Format**: PNG or JPEG
- **Content**: App icon + tagline

#### Large Promotional Tile (Optional)
- **Size**: 920x680 pixels
- **Format**: PNG or JPEG

#### Marquee Promotional Tile (Optional)
- **Size**: 1400x560 pixels
- **Format**: PNG or JPEG

## Step 2: Register as Chrome Web Store Developer

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Pay the one-time $5 developer registration fee
4. Accept the developer agreement

## Step 3: Prepare Your Extension Package

### Create a ZIP file containing:
```
chrome-extension.zip
├── index.html
├── script.js
├── sw.js
├── manifest.json
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── particles.js-master/
    └── particles.min.js
```

**Important**: 
- Do NOT include the `chrome-extension` folder itself in the ZIP
- ZIP the contents directly
- Maximum size: 20MB (you're well under this)

### To create the ZIP:
1. Navigate to the `chrome-extension` folder
2. Select all files and folders
3. Right-click → Send to → Compressed (zipped) folder
4. Name it `search-portal-extension.zip`

## Step 4: Fill Out Store Listing

### Product Details

**Display Name** (required, max 45 chars):
```
Search Portal - Premium New Tab
```

**Summary** (required, max 132 chars):
```
Beautiful new tab with search, widgets, focus mode & productivity tools. Works offline. No tracking.
```

**Description** (required, max 16,000 chars):
```
Transform your new tab into a stunning productivity hub with Search Portal!

🎨 BEAUTIFUL DESIGN
• Apple-inspired glassmorphism UI
• Smooth animations and particle effects
• Dark theme optimized for any time of day
• Screensaver mode with elegant clock display

🔍 SMART SEARCH
• Multiple search engines in one place
• Quick shortcuts (/g for Google, /y for YouTube, etc.)
• Instant engine switching
• Clean, distraction-free interface

📱 PINNED APPS
• Add your favorite websites to the dock
• Custom icons support
• Beautiful hover effects
• Works offline with cached icons

⏰ PRODUCTIVITY WIDGETS
• Pomodoro Timer (Focus/Short/Long breaks)
• Custom Timer (set any duration)
• Stopwatch with precision timing
• To-Do List with completed tasks section
• Quick Notes with auto-save
• Full-featured Calculator
• Weather widget

🎵 AMBIENT SOUNDS
• Rain, Cafe, Fire, Wind sounds
• Individual volume controls
• Play multiple sounds together
• Perfect for focus and relaxation

🎯 FOCUS MODE
• Press 'F' to hide all distractions
• Shows only the clock
• Perfect for deep work sessions
• Quick toggle on/off

🔒 PRIVACY FIRST
• 100% offline after first load
• No tracking or analytics
• All data stored locally
• No account required
• Open source code

✨ FEATURES
• Draggable widgets - position them anywhere
• Multiple widgets open simultaneously
• Keyboard shortcuts for power users
• Auto-save for all your data
• Responsive design
• Works completely offline

Perfect for students, professionals, and anyone who wants a beautiful, functional new tab page!

Made with ❤️ for productivity enthusiasts.
```

**Category** (required):
- Select: **Productivity**

**Language** (required):
- Select: **English (United States)**

### Privacy Practices

**Single Purpose** (required):
```
This extension replaces the new tab page with a beautiful, feature-rich productivity dashboard including search, widgets, and focus tools.
```

**Permission Justification**:
```
Storage: Required to save user preferences, bookmarks, notes, and to-do items locally on the user's device.
```

**Data Usage**:
- Check: "This item does not collect user data"

**Privacy Policy URL** (required if collecting data):
- Upload `PRIVACY.md` to a public URL (GitHub, your website, etc.)
- Or use: `https://github.com/yourusername/search-portal/blob/main/PRIVACY.md`

## Step 5: Upload Your Extension

1. Click "New Item" in the developer dashboard
2. Click "Choose file" and select your ZIP file
3. Click "Upload"
4. Wait for the upload to complete

## Step 6: Add Store Assets

1. **Icons**: Upload the 128x128 icon (auto-detected from manifest)
2. **Screenshots**: Upload 1-5 screenshots
3. **Promotional images**: Upload small tile (440x280) at minimum

## Step 7: Set Distribution

**Visibility**:
- **Public**: Anyone can find and install
- **Unlisted**: Only people with the link can install
- **Private**: Only specific users/groups (requires Google Workspace)

**Recommended**: Start with **Unlisted** for testing, then switch to **Public**

**Regions**:
- Select: **All regions** (or specific countries)

**Pricing**:
- Select: **Free**

## Step 8: Submit for Review

1. Review all information carefully
2. Click "Submit for review"
3. Wait for Google's review (typically 1-3 business days)

## Step 9: Review Process

Google will check:
- ✅ Manifest validity
- ✅ Privacy policy compliance
- ✅ No malicious code
- ✅ Accurate description
- ✅ Proper permissions usage

**Common Rejection Reasons**:
- Missing or unclear privacy policy
- Excessive permissions
- Misleading description
- Low-quality screenshots
- Trademark violations

## Step 10: After Approval

Once approved:
1. Your extension will be live on the Chrome Web Store
2. You'll receive an email confirmation
3. Share your extension link: `https://chrome.google.com/webstore/detail/[your-extension-id]`

## Updating Your Extension

To release updates:
1. Update the `version` in `manifest.json` (e.g., 1.0.0 → 1.1.0)
2. Create a new ZIP file
3. Go to your extension in the developer dashboard
4. Click "Package" → "Upload updated package"
5. Submit for review again

## Tips for Success

### Increase Visibility
- Use relevant keywords in description
- Create high-quality screenshots
- Add promotional images
- Respond to user reviews
- Share on social media

### Maintain Quality
- Fix bugs quickly
- Listen to user feedback
- Keep privacy policy updated
- Test thoroughly before updates

### Marketing
- Create a landing page
- Post on Reddit (r/chrome, r/productivity)
- Share on Twitter/X
- Write a blog post
- Create a demo video

## Checklist Before Submission

- [ ] All icons created (16, 48, 128px)
- [ ] At least 1 screenshot captured
- [ ] Privacy policy written and hosted
- [ ] Manifest.json version is 1.0.0
- [ ] Extension tested in Chrome
- [ ] ZIP file created correctly
- [ ] Description is compelling and accurate
- [ ] No console errors
- [ ] All features work offline
- [ ] Developer account registered
- [ ] $5 fee paid

## Resources

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Chrome Web Store Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Best Practices](https://developer.chrome.com/docs/webstore/best-practices/)

## Need Help?

- Chrome Web Store Help Center
- Stack Overflow (tag: chrome-extension)
- Chrome Extension Google Group

---

Good luck with your submission! 🚀
