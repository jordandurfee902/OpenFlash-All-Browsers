const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Firebase v10+ uses .mjs files, so we need to add them to sourceExts
config.resolver.sourceExts.push('mjs');

module.exports = config;
