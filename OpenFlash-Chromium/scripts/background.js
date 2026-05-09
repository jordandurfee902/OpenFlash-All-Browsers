// Manifest V3 Background Service Worker
import { openFlashDB } from '../src/db.js';

chrome.runtime.onInstalled.addListener(() => {
    console.log("openFlash Extension installed.");
});

// Open library when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.create({
        url: chrome.runtime.getURL("index.html")
    });
});

// Message listener for cross-origin database operations
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "save_image_base64") {
        // Convert Base64 back to Blob
        fetch(request.base64)
            .then(res => res.blob())
            .then(blob => openFlashDB.saveImage(blob))
            .then(imageId => {
                sendResponse({ success: true, imageId: imageId });
            })
            .catch(err => {
                console.error("Background: Failed to save image:", err);
                sendResponse({ success: false, error: err.message });
            });
        return true; // Keep channel open
    }

    if (request.action === "save_image_url") {
        fetch(request.url)
            .then(res => res.blob())
            .then(blob => openFlashDB.saveImage(blob))
            .then(imageId => {
                sendResponse({ success: true, imageId: imageId });
            })
            .catch(err => {
                console.error("Background: Failed to fetch/save image from URL:", err);
                sendResponse({ success: false, error: err.message });
            });
        return true;
    }

    if (request.action === "delete_image") {
        openFlashDB.deleteImage(request.imageId).then(() => {
            sendResponse({ success: true });
        }).catch(err => {
            sendResponse({ success: false, error: err.message });
        });
        return true;
    }

    if (request.action === "ping") {
        sendResponse({ status: "pong" });
    }
    
    return true; 
});
