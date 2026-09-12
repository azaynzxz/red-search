// Search Portal - Chrome Extension Background Service Worker (Manifest V3)
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Search Portal New Tab extension installed successfully.');
    } else if (details.reason === 'update') {
        console.log('Search Portal New Tab extension updated to latest version.');
    }
});
