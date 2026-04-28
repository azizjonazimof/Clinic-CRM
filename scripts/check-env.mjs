import { existsSync, readFileSync } from "node:fs";

if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

const required = {
  DATABASE_URL: (value) => /^postgresql:\/\//.test(value),
  JWT_SECRET: (value) => value.length >= 32
};

const missing = Object.entries(required)
  .filter(([key, validate]) => !process.env[key] || !validate(process.env[key]))
  .map(([key]) => key);

if (missing.length) {
  console.error(`Invalid or missing production environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("Production environment variables are valid.");
