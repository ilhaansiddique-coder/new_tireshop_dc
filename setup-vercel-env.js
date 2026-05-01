#!/usr/bin/env node

/**
 * Setup Vercel Environment Variables
 * Run this script to configure all environment variables for Vercel deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const envVars = {
  'EONTYRE_API_URL': 'https://p511.eontyre.com',
  'EONTYRE_API_KEY': 'b9b77f6e3a2448d58cc289fb6e961c77',
  'QLIRO_API_KEY': 'DACKA',
  'QLIRO_API_SECRET': '16f19327d54d483f',
  'QLIRO_API_URL': 'https://pago.qit.nu',
  'BASE_URL': 'https://project-1e8p4.vercel.app',
  'FRAKTJAKT_CONSIGNOR_ID': '39289',
  'FRAKTJAKT_CONSIGNOR_KEY': '559c8814e88e3a689361ab4782172d72e461d301',
  'SHOP_ORIGIN_STREET': 'Musköstgatan 2',
  'SHOP_ORIGIN_POSTAL': '25220',
  'SHOP_ORIGIN_CITY': 'Helsingborg'
};

console.log('🔧 Setting up Vercel environment variables...\n');

Object.entries(envVars).forEach(([key, value]) => {
  try {
    console.log(`Setting ${key}...`);
    execSync(`npx vercel env add ${key} --non-interactive <<< "${value}" 2>/dev/null`, {
      stdio: 'pipe',
      shell: '/bin/bash'
    });
    console.log(`✅ ${key} set successfully\n`);
  } catch (err) {
    console.log(`⚠️  ${key} may need manual setup\n`);
  }
});

console.log('\n✅ Environment setup attempt completed!');
console.log('\nIf some variables failed, please set them manually via:');
console.log('  https://vercel.com/ilhaansiddique-coders-projects/project-1e8p4/settings/environment-variables');
