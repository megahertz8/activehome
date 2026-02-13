# Soft Launch Checklist

## Before Sending Invites

### ✅ Done
- [x] Build fix: supabase-server.ts env vars restored to NEXT_PUBLIC_*
- [x] Build fix: epc-local.ts resilient for serverless (DB existence check)
- [x] Feedback form created at /feedback with sanitized API endpoint
- [x] Feedback SQL migration written (004_feedback_table.sql)
- [x] Invite messages drafted (Telegram EN/HE + Email)
- [x] Code pushed to GitHub (all 3 commits)

### ⚠️ Eran Needs To Do
- [ ] **Run Supabase migration**: Go to [SQL Editor](https://supabase.com/dashboard/project/exrnpqwdnwlzsumaubci/sql) → paste contents of `supabase/migrations/004_feedback_table.sql` → Run
- [ ] **Set Vercel env vars** (in Vercel Dashboard → Project → Settings → Environment Variables):
  - `NEXT_PUBLIC_SUPABASE_URL` = `https://exrnpqwdnwlzsumaubci.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (from .env.local)
  - `SUPABASE_SERVICE_ROLE_KEY` = (from .env.local)
  - `EPC_API_TOKEN` = (from .env.local)
  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` = (get from GCP Console)
- [ ] **Login to Vercel CLI**: `vercel login` (for future deploys)
- [ ] **Deploy to Vercel**: `vercel --prod` or push triggers if Git connected
- [ ] **Test feedback form**: Visit /feedback on deployed URL, submit test
- [ ] **Send invites**: Use messages from `soft-launch/invite-message-telegram.md`

### Nice-to-have Before Launch
- [ ] Resend domain verification (check status)
- [ ] Google Maps API key in env vars
- [ ] Social media accounts (@evolvinghome)

## Invite List (5 friends)
1. ________ (Telegram)
2. ________ (Telegram)
3. ________ (Email)
4. ________ (Telegram)
5. ________ (Email)

## Post-Launch Monitoring
- Check feedback table: `curl -s "https://exrnpqwdnwlzsumaubci.supabase.co/rest/v1/feedback?select=*" -H "apikey: <service_role_key>"`
- Check Cloudflare analytics for traffic spikes
- Watch for error logs in Vercel dashboard
