const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:8080",
    headless: true,
  },
  webServer: [
    {
      command: "cd backend && go run .",
      url: "http://127.0.0.1:3000/api/hello",
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: "npx http-server ./frontend -p 8080 -c-1",
      url: "http://127.0.0.1:8080",
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
});
