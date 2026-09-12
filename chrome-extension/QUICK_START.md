# Quick Start Guide

## Testing Your Extension Locally

### Step 1: Load the Extension
1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the `chrome-extension` folder
6. The extension should now appear in your extensions list

### Step 2: Test the Extension
1. Open a new tab (Ctrl+T or Cmd+T)
2. You should see the Search Portal instead of the default new tab
3. Test all features:
   - ✅ Search with different engines
   - ✅ Add pinned apps
   - ✅ Open widgets (click dock icons)
   - ✅ Drag widgets around
   - ✅ Press 'F' for focus mode
   - ✅ Wait 1 minute for screensaver mode
   - ✅ Add todos and check them off
   - ✅ Test offline (disconnect internet)

### Step 3: Check for Errors
1. Right-click on the extension page
2. Select **Inspect** to open DevTools
3. Check the **Console** tab for any errors
4. Fix any issues before publishing

## Common Issues & Solutions

### Icons Not Showing
- Make sure all three icon files exist in `icons/` folder
- Check that manifest.json paths are correct
- Reload the extension after adding icons

### Particles Not Working
- Ensure `particles.js-master/particles.min.js` exists
- Check browser console for loading errors
- Verify the path in index.html is correct

### Offline Mode Not Working
- Open DevTools → Application → Service Workers
- Check if service worker is registered
- Click "Update" to refresh the service worker
- Clear cache and reload

### Widgets Not Opening
- Check browser console for JavaScript errors
- Ensure script.js is loaded correctly
- Verify all Material Icons are loading

## Before Publishing Checklist

- [ ] Extension loads without errors
- [ ] All widgets function correctly
- [ ] Pinned apps can be added/removed
- [ ] Search works with all engines
- [ ] Focus mode toggles properly
- [ ] Screensaver activates after idle time
- [ ] Icons display correctly (16, 48, 128px)
- [ ] Extension works offline
- [ ] No console errors
- [ ] Privacy policy is ready
- [ ] Screenshots are captured
- [ ] Description is written

## Next Steps

1. **Test thoroughly** - Use the extension for a few days
2. **Take screenshots** - Capture beautiful views of your extension
3. **Write description** - Use the template in PUBLISHING_GUIDE.md
4. **Create ZIP file** - Package everything for upload
5. **Submit to Chrome Web Store** - Follow PUBLISHING_GUIDE.md

## File Structure

```
chrome-extension/
├── manifest.json          # Extension configuration
├── index.html            # Main new tab page
├── script.js             # All JavaScript functionality
├── sw.js                 # Service worker for offline support
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── particles.js-master/  # Particle animation library
│   └── particles.min.js
├── README.md             # Project documentation
├── PRIVACY.md            # Privacy policy
├── PUBLISHING_GUIDE.md   # How to publish
└── QUICK_START.md        # This file
```

## Tips

- **Test in Incognito**: Make sure it works in incognito mode
- **Test on Different Screens**: Check responsiveness
- **Clear Data**: Test with fresh localStorage
- **Update Version**: Increment version number for updates
- **Keep Backups**: Save copies before major changes

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review the manifest.json for typos
3. Ensure all files are in the correct locations
4. Try reloading the extension
5. Clear browser cache and reload

---

Happy testing! 🚀
