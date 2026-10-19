// PM2 : garde l'API en vie (redémarrage après crash ou reboot du serveur).
// Le port et les secrets viennent de backend/.env (lu par dotenv depuis le cwd ci-dessous).
const path = require("node:path");

module.exports = {
  apps: [
    {
      name: "global-transit-api",
      cwd: path.join(__dirname, "backend"),
      script: "dist/index.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 50,
      restart_delay: 3000,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
