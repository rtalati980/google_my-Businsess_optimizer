# AI Description Generator - Setup Guide

## ⚡ Quick Start (5 minutes)

### Step 1: Configure AI Provider

Copy the environment template:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set your AI provider. Choose ONE:

**Option 1: Anthropic Claude (Recommended - Most reliable)**
```bash
AI_PROVIDER=anthropic
AI_API_KEY=sk-ant-xxx...  # Get from https://console.anthropic.com/keys
```

**Option 2: Groq (Fastest - Best for demo)**
```bash
AI_PROVIDER=groq
AI_API_KEY=gsk_xxx...  # Get from https://console.groq.com/keys
```

**Option 3: OpenAI**
```bash
AI_PROVIDER=openai
AI_API_KEY=sk-xxx...  # Get from https://platform.openai.com/api-keys
```

**Option 4: Google Gemini**
```bash
AI_PROVIDER=gemini
AI_API_KEY=AIza...  # Get from https://makersuite.google.com/app/apikey
```

**Option 5: OpenRouter**
```bash
AI_PROVIDER=openrouter
AI_API_KEY=sk-or-xxx...  # Get from https://openrouter.ai
```

### Step 2: Verify MongoDB

Ensure MongoDB is configured in your `.env`:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bizlocalpilot...
```

### Step 3: Start Development Server

```bash
cd frontend
npm run dev
```

### Step 4: Access the Feature

1. Go to http://localhost:3000/dashboard
2. Login with your account
3. Click "AI Descriptions" in the sidebar
4. Fill the form and generate!

---

## 🧪 Testing Checklist

### Form Input Test
- [ ] Fill in all required fields:
  - Business Name: "My Restaurant"
  - Category: "Restaurant"
  - Primary Service: "Italian Pizza"
  - City: "Mumbai"
  
- [ ] Fill optional fields:
  - Area: "Andheri"
  - Keywords: "authentic, Italian, pizza"
  - Unique Selling Points: "Award-winning, Family-owned"

### Generation Test
- [ ] Click "Generate Description"
- [ ] Wait for generation (10-20 seconds depending on AI provider)
- [ ] Verify output contains:
  - SEO Title (under 80 chars)
  - 500-word description
  - Top keywords (at least 10)
  - Quality score (0-100)

### Copy/Download Test
- [ ] Click copy button on description
- [ ] Paste in notepad to verify
- [ ] Click download button
- [ ] Verify TXT file downloads

### History Test
- [ ] Generate 2-3 descriptions
- [ ] Scroll down to "Generation History"
- [ ] Verify all generations appear
- [ ] Click view to re-display past generation
- [ ] Click delete to remove from history

### Error Handling Test
- [ ] Clear business name and click generate
- [ ] Should show validation error
- [ ] Verify form prevents submission

---

## 🔧 Troubleshooting

### Error: "API key is invalid"

**Solution:**
1. Verify you copied the key correctly (no extra spaces)
2. Check key is for the right provider
3. Regenerate key in provider dashboard
4. Restart development server: `npm run dev`

### Error: "Rate limit exceeded"

**Solution:**
- Wait 60 seconds and retry
- Default limit: 10 requests per minute
- To increase, edit `frontend/app/api/generate-description/route.ts` line 23

### Generation takes too long (>30 seconds)

**Solution:**
- Switch to faster provider: Groq (3-5s) or OpenRouter
- Check internet connection
- Verify API key has usage quota

### Error: "Cannot read property '_id' of null"

**Solution:**
- Ensure MongoDB is running
- Verify `MONGODB_URI` in `.env`
- Check database connection with: `mongosh mongodb://...`

### Descriptions are generic/poor quality

**Solution:**
- Add more details to "Unique Selling Points"
- Provide relevant keywords
- Choose appropriate tone (Professional/Luxury vs Friendly)
- Try longer description (750 words instead of 500)

---

## 📊 Production Deployment

### Before Going Live

**Security:**
- [ ] Set `AI_API_KEY` as environment secret (not in git)
- [ ] Enable MongoDB connection pooling
- [ ] Add rate limiting to Redis (optional)
- [ ] Enable HTTPS only
- [ ] Set `NODE_ENV=production`

**Performance:**
- [ ] Test with 100+ concurrent users
- [ ] Monitor AI provider usage/costs
- [ ] Enable response caching
- [ ] Optimize database indexes

**Monitoring:**
- [ ] Setup error tracking (Sentry, LogRocket)
- [ ] Monitor API response times
- [ ] Track generation success rate
- [ ] Alert on rate limit breaches

### Deploy to Production

```bash
# Build optimized version
npm run build

# Set environment variables
export AI_PROVIDER=anthropic
export AI_API_KEY=sk-ant-xxx...
export MONGODB_URI=mongodb+srv://...

# Start production server
npm run start
```

---

## 💡 Integration Examples

### Example 1: Using Anthropic Claude

```bash
# In .env.local
AI_PROVIDER=anthropic
AI_API_KEY=sk-ant-abc123xyz789...
```

Expected response time: 8-12 seconds

### Example 2: Using Groq for Speed

```bash
# In .env.local
AI_PROVIDER=groq
AI_API_KEY=gsk_abc123xyz789...
```

Expected response time: 3-5 seconds (fastest option)

### Example 3: Multi-Provider Setup

Create separate deployment configs:

```bash
# production-anthropic.env
AI_PROVIDER=anthropic
AI_API_KEY=sk-ant-prod-key...

# production-groq.env
AI_PROVIDER=groq
AI_API_KEY=gsk_prod-key...
```

Switch at deployment time based on load.

---

## 📈 Usage Estimation

### API Costs per 1000 Descriptions

| Provider | Cost | Speed | Quality |
|----------|------|-------|---------|
| Anthropic Claude 3.5 | ~$3-5 | 8-12s | Excellent |
| OpenAI GPT-4 | ~$2-3 | 5-8s | Excellent |
| Google Gemini | ~$1-2 | 10-15s | Good |
| Groq | ~$0 | 3-5s | Good |
| OpenRouter | ~$1-4 | 5-10s | Excellent |

**Recommendation:** 
- Dev/Testing: Use Groq (free, fast)
- Production: Use Anthropic or OpenRouter (best quality/price)

---

## 🚀 Next Steps

1. **Setup & Test** (Today)
   - Configure AI provider
   - Generate 5 test descriptions
   - Verify quality

2. **Distribute to Beta Users** (Week 1)
   - Give to 10-20 restaurants/clinics
   - Collect feedback
   - Measure engagement

3. **Optimize** (Week 2)
   - Improve prompts based on feedback
   - Add more business categories
   - Increase generation options

4. **Scale** (Week 3+)
   - Market to 100+ businesses
   - Track usage metrics
   - Collect case studies
   - Plan premium features

---

## 📞 Support

### Testing Issues?

Check logs:
```bash
# Terminal where dev server runs
npm run dev
# Look for [API] errors

# Browser console
F12 → Console tab
# Look for fetch errors or 400/500 responses
```

### Database Issues?

Connect directly:
```bash
mongosh mongodb+srv://username:password@cluster.mongodb.net/bizlocalpilot
db.description_generations.find().limit(5)
```

### AI Provider Issues?

Test API key directly:
```bash
# Anthropic
curl -H "x-api-key: YOUR_KEY" \
  https://api.anthropic.com/v1/messages \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":100,"messages":[{"role":"user","content":"Hi"}]}'

# OpenAI
curl -H "Authorization: Bearer YOUR_KEY" \
  https://api.openai.com/v1/models
```

---

## 📚 File Reference

| File | Purpose |
|------|---------|
| `frontend/lib/db/description-generations.ts` | Database CRUD operations |
| `frontend/lib/ai/providers.ts` | AI provider abstraction |
| `frontend/lib/ai/prompts.ts` | Prompt engineering templates |
| `frontend/app/api/generate-description/route.ts` | Main generation endpoint |
| `frontend/app/api/descriptions/[id]/route.ts` | CRUD operations |
| `frontend/app/api/descriptions/history/route.ts` | History retrieval |
| `frontend/app/api/descriptions/favorites/route.ts` | Favorites management |
| `frontend/app/dashboard/description-generator/page.tsx` | UI component |
| `frontend/docs/AI_DESCRIPTION_GENERATOR.md` | Full documentation |

---

**You're all set!** 🚀 Start generating descriptions and watch your users love it!
