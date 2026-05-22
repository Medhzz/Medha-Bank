/**
 * Medha Bank — Local Setup Script
 * Run: node SETUP.js
 *
 * This script checks your environment and prints setup instructions.
 */

import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";

console.log("\n╔══════════════════════════════════════╗");
console.log("║        Medha Bank — Setup Check      ║");
console.log("╚══════════════════════════════════════╝\n");

// Check Node version
const nodeVersion = process.version;
const major = parseInt(nodeVersion.slice(1));
console.log(`✅ Node.js: ${nodeVersion}`);
if (major < 18) {
  console.log("⚠️  Warning: Node.js 18+ recommended.");
}

// Check .env file
if (existsSync(".env")) {
  const env = readFileSync(".env", "utf8");
  const required = [
    "VITE_BANK_ID",
    "VITE_BANK_NAME",
    "VITE_IFSC_CODE",
    "VITE_PRIVATE_API_KEY",
    "VITE_PRIVATE_PROJECT_ID",
    "VITE_HUB_API_KEY",
    "VITE_HUB_PROJECT_ID",
    "VITE_HUB_BANK_EMAIL",
    "VITE_HUB_BANK_PASSWORD",
  ];
  const missing = required.filter((k) => !env.includes(k + "=") || env.includes(k + "=\n") || env.includes(k + "=your_"));
  if (missing.length === 0) {
    console.log("✅ .env: All required variables found.");
  } else {
    console.log("⚠️  .env: Missing or empty values for:");
    missing.forEach((k) => console.log(`   - ${k}`));
  }
} else {
  console.log("❌ .env not found. Copy .env.example to .env and fill in your Firebase credentials.");
  console.log("   Run: cp .env.example .env");
}

// Check node_modules
if (existsSync("node_modules")) {
  console.log("✅ node_modules: Dependencies installed.");
} else {
  console.log("❌ node_modules not found. Run: npm install");
}

console.log("\n📋 Run commands:");
console.log("   npm install     — Install dependencies");
console.log("   npm run dev     — Start dev server at http://localhost:5173");
console.log("   npm run build   — Build for production");
console.log("\n🔑 Admin login:");
console.log("   Email:    medhaharini.d@gmail.com");
console.log("   Password: medha123");
console.log("\n");
