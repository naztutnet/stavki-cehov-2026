const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const storageKey = source.indexOf('const BUDGET_STORAGE_KEY = "kinorates-budget-v4";');
const initialLoad = source.indexOf("const budgetItems = loadBudget();");

if (storageKey < 0 || initialLoad < 0) throw new Error("Budget initialization statements are missing");
if (storageKey > initialLoad) throw new Error("Budget storage key must be initialized before loading saved items");

console.log("Budget persistence initialization OK");
