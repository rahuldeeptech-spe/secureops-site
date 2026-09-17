# SecureOps public landing (secrets-free)

Static copy of the marketing site. **No phone, Gmail, UPI, jobs, or leads.**

Source of truth to copy from: `BBH/business/site/` (html/css/js/privacy/terms/contact.json/favicon).

Do not copy: `desk/operator.json`, `desk/pay.json`, `desk/jobs/`, `desk/leads/`.

## Local

```bash
svc site
# http://127.0.0.1:8091/
```

## Public GitHub Pages (you confirm)

```bash
CONFIRM=1 /Volumes/UNDERTAKER/BBH/public/secureops-site/deploy.sh
```

Creates/updates `rahuldeeptech-spe/secureops-site` with **only** this folder. Paid ads still wait until the Pages URL is live, then put it in `business/site/contact.json` → `public_url`.
