#!/usr/bin/env bash
# Secrets-free landing → optional public GitHub Pages.
set -euo pipefail
SRC="/Volumes/UNDERTAKER/BBH/business/site"
DST="/Volumes/UNDERTAKER/BBH/public/secureops-site"
REPO="rahuldeeptech-spe/secureops-site"

mkdir -p "$DST"
rsync -a \
  --exclude 'serve.py' \
  --exclude 'verify_preview.py' \
  --exclude '__pycache__' \
  --exclude 'ads' \
  --exclude '.git' \
  --exclude 'README.md' \
  --exclude 'deploy.sh' \
  "$SRC/" "$DST/"
touch "$DST/.nojekyll"

python3 - <<'PY'
import json
from pathlib import Path
p = Path("/Volumes/UNDERTAKER/BBH/public/secureops-site/contact.json")
c = json.loads(p.read_text())
for k in ("email", "whatsapp", "whatsapp_e164", "upi_id", "gstin"):
    if str(c.get(k) or "").strip():
        raise SystemExit(f"REFUSE: {k} would leak on GitHub Pages")
print("contact.json public-safe")
PY

if [[ "${CONFIRM:-}" != "1" ]]; then
  echo "Synced $DST (no push). Pages: CONFIRM=1 $0"
  exit 2
fi

cd "$DST"
if [[ ! -d .git ]]; then
  git init -q
  git branch -M main
fi
git add -A
git status
git commit -m "SecureOps public landing (no phone/email/UPI)" || echo "nothing to commit"

if git remote get-url origin >/dev/null 2>&1; then
  git push -u origin main
else
  gh repo create "$REPO" --public --source . --remote origin --push
fi

gh api -X POST "repos/${REPO}/pages" \
  -f "source[branch]=main" -f "source[path]=/" >/dev/null 2>&1 || \
gh api -X PUT "repos/${REPO}/pages" \
  -f "source[branch]=main" -f "source[path]=/" >/dev/null 2>&1 || true

echo "Pages (wait 1–2 min): https://rahuldeeptech-spe.github.io/secureops-site/"
echo "Repo: https://github.com/${REPO}"
