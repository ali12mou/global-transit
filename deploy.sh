#!/usr/bin/env bash
# Déploiement sur le serveur : récupère la branche, installe, compile, (re)démarre l'API avec PM2
# puis vérifie /api/health. Lancé automatiquement par GitHub Actions, ou à la main :
#   cd /var/www/global-transit-hub && npm run deploy
set -euo pipefail

cd "$(dirname "$0")"
BRANCH="${DEPLOY_BRANCH:-main}"
APP_NAME="global-transit-api"

# Shell SSH non interactif : charger nvm si Node a été installé avec.
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  set +u
  # shellcheck disable=SC1091
  . "$NVM_DIR/nvm.sh"
  set -u
fi

echo "==> Mise à jour du code ($BRANCH)"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"
git log --oneline -1

echo "==> Installation des dépendances"
npm ci --include=dev --no-audit --no-fund

echo "==> Compilation backend + frontend"
npm run build

echo "==> (Re)démarrage de l'API avec PM2"
command -v pm2 >/dev/null || npm install -g pm2
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save
# Redémarrage automatique de PM2 au boot (une seule fois, nécessite root).
if [ "$(id -u)" = 0 ] && [ ! -f /etc/systemd/system/pm2-root.service ]; then
  pm2 startup systemd -u root --hp /root
fi

PORT="$(grep -E '^PORT=' backend/.env 2>/dev/null | tail -1 | cut -d= -f2 | tr -d "\"' \r" || true)"
PORT="${PORT:-5006}"
echo "==> Vérification http://127.0.0.1:$PORT/api/health"
for _ in $(seq 1 15); do
  if curl -fsS "http://127.0.0.1:$PORT/api/health"; then
    echo
    echo "Déploiement OK"
    exit 0
  fi
  sleep 2
done

echo "ERREUR : l'API ne répond pas correctement sur le port $PORT." >&2
curl -sS "http://127.0.0.1:$PORT/api/health" >&2 || true
pm2 logs "$APP_NAME" --lines 40 --nostream >&2 || true
exit 1
