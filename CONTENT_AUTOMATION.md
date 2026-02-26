# Content Automation for @Content Creator

This document explains how to set up automated content generation that creates 2 blog post drafts per day based on trending topics.

## Features

- 🤖 **Auto-generates** 2 content drafts daily
- 📈 **Trend-based** topics (configured for tech/software topics)
- 📝 **Draft mode** — all generated content starts as unpublished drafts
- ✨ **Manual trigger** — "Generate Content" button in admin dashboard
- 📬 **Notifications** — optional alerts when new drafts are ready

## Manual Generation (Admin Dashboard)

1. Log in to the admin dashboard at `/dashboard/blog`
2. Click the **"Generate Content"** button in the top-right
3. Wait a few seconds — the system will create 2 draft posts
4. Refresh or review the post list — new drafts are marked with `[DRAFT]`
5. Click "Edit" on any draft to expand and publish

## Automated Daily Generation (Cron Job)

### Option A: OpenClaw Cron (Recommended for Entro users)

Use OpenClaw's built-in cron system to schedule content generation:

**Morning generation (9:00 AM UTC):**
```bash
openclaw cron add --schedule="0 9 * * *" --task="Generate morning content drafts" --command="curl -X POST -H 'x-cron-token: YOUR_SECRET_HERE' https://next.orossaraban.com/api/generate-content"
```

**Evening generation (5:00 PM UTC):**
```bash
openclaw cron add --schedule="0 17 * * *" --task="Generate evening content drafts" --command="curl -X POST -H 'x-cron-token: YOUR_SECRET_HERE' https://next.orossaraban.com/api/generate-content"
```

**Set the cron secret** (in your deployment's environment variables):
```bash
CRON_SECRET=your-random-secret-token-here
```

### Option B: System Cron

Add to your server's crontab (`crontab -e`):

```cron
# Generate content drafts at 9 AM and 5 PM UTC
0 9 * * * curl -X POST -H "x-cron-token: YOUR_SECRET_HERE" https://next.orossaraban.com/api/generate-content
0 17 * * * curl -X POST -H "x-cron-token: YOUR_SECRET_HERE" https://next.orossaraban.com/api/generate-content
```

### Option C: GitHub Actions (CI/CD)

Create `.github/workflows/generate-content.yml`:

```yaml
name: Generate Content
on:
  schedule:
    - cron: '0 9,17 * * *'  # 9 AM and 5 PM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger content generation
        run: |
          curl -X POST \\
            -H "x-cron-token: ${{ secrets.CRON_SECRET }}" \\
            https://next.orossaraban.com/api/generate-content
```

## Configuration

### Environment Variables

Add these to your deployment (Docker, Vercel, Railway, etc.):

```bash
# Required for cron authentication
CRON_SECRET=your-random-secret-token-here

# Optional: customize trending topic sources
CONTENT_TOPICS=technology,software,ai,web-development
```

### Customizing Topics

Edit `/lib/content-generator.ts` to:
- Change the trending topic sources
- Integrate with Twitter API, Google Trends, or Reddit
- Adjust content templates
- Change the number of daily posts

Example:
```typescript
// In lib/content-generator.ts
const trendSearches = [
  "trending technology news today",
  "popular AI topics this week",
  "hot software development trends",
];
```

## Workflow for @Content Creator

1. **Morning** (9 AM): Automated drafts are created
2. **Review**: Check `/dashboard/blog` — new drafts appear at the top
3. **Edit**: Click "Edit" on a draft
4. **Expand**: Fill in the [To be expanded] sections
5. **Add images**: Use "Upload Cover" and "Insert Image"
6. **Publish**: Check "Publish immediately" and click "Update Post"

7. **Evening** (5 PM): Second batch of drafts arrives
8. **Repeat**: Review, edit, and publish

## Notifications (Optional)

To get notified when new drafts are ready, @DevOps Engineer can set up:

**Slack/Discord webhook:**
```bash
# After each cron run, send a notification
curl -X POST https://hooks.slack.com/... -d '{"text":"📝 New blog drafts ready for review!"}'
```

**Email via SendGrid/Mailgun:**
Add email notification logic to `/app/api/generate-content/route.ts`

## Troubleshooting

**No drafts appear:**
- Check if `CRON_SECRET` matches in both the cron job and env vars
- Verify the API endpoint is reachable: `curl -I https://next.orossaraban.com/api/generate-content`
- Check Docker logs: `docker logs next-app`

**Drafts are low quality:**
- The current version uses basic templates
- For better quality, integrate with OpenAI GPT-4, Claude, or Gemini
- Edit `/lib/content-generator.ts` to add AI-powered content generation

**Cron not firing:**
- Verify cron syntax: `https://crontab.guru/`
- Check server timezone: `date` (cron times are usually UTC)
- Review cron logs: `grep CRON /var/log/syslog` (Linux)

## Next Steps

- **Integrate AI**: Use OpenAI/Claude API for higher-quality drafts
- **Real trends**: Connect to Twitter API, Google Trends, or Reddit API
- **Smart scheduling**: Adjust timing based on your audience's timezone
- **Analytics**: Track which auto-generated topics get the most engagement

---

For questions or customization requests, contact @Lead Developer or @DevOps Engineer.
