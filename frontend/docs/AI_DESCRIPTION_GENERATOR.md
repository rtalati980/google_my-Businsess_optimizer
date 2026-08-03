# AI Business Description Generator

A production-ready AI-powered tool to generate SEO-optimized business descriptions for any industry in seconds.

## 🎯 Features

### Description Generation
- **Multiple Lengths**: Generate descriptions in 4 lengths (80, 250, 500, 750 words)
- **Dynamic Business Types**: Works with any business category (restaurants, dermatology, salons, clinics, etc.)
- **SEO Optimized**: Automatically incorporates keywords and local SEO best practices
- **Professional Tones**: Choose from 7 different tones (Friendly, Professional, Luxury, Premium, Modern, Local, Family)
- **Call-to-Action**: Select from 6 CTA options or none

### Analysis & Insights
- **Auto-Generated SEO Title**: Perfect for Google Business Profile
- **Keyword Extraction**: Top 20 keywords extracted from description
- **FAQ Generation**: 5-7 common questions customers might ask
- **Category Suggestions**: Auto-suggested business categories
- **Hashtag Generation**: 15-20 relevant hashtags for social media
- **Quality Scoring**: Comprehensive quality metrics (0-100) with breakdown:
  - SEO Optimization score
  - Readability score
  - Keyword Usage score
  - Local SEO score
  - Call-to-Action effectiveness score
  - Trust & Credibility score

### History & Management
- **Generation History**: Track all past generations
- **Search History**: Filter generations by business name, category, city
- **Favorites**: Save favorite descriptions for later
- **Quick Actions**: Copy, download, delete, view details
- **Statistics**: View generation stats and top categories

## 🚀 Getting Started

### 1. Setup AI Provider

Choose your AI provider and get an API key:

**Option A: Anthropic Claude (Recommended)**
```bash
export AI_PROVIDER=anthropic
export AI_API_KEY=sk-ant-... # Get from https://console.anthropic.com
```

**Option B: OpenAI**
```bash
export AI_PROVIDER=openai
export AI_API_KEY=sk-... # Get from https://platform.openai.com/api-keys
```

**Option C: Google Gemini**
```bash
export AI_PROVIDER=gemini
export AI_API_KEY=AIza... # Get from https://makersuite.google.com/app/apikey
```

**Option D: Groq (Fastest inference)**
```bash
export AI_PROVIDER=groq
export AI_API_KEY=gsk_... # Get from https://console.groq.com
```

**Option E: OpenRouter (Multi-model)**
```bash
export AI_PROVIDER=openrouter
export AI_API_KEY=sk-or-... # Get from https://openrouter.ai
```

### 2. Configure MongoDB

The database is already configured in `.env`, but ensure:
```bash
MONGODB_URI=mongodb+srv://...
```

### 3. Start the Application

```bash
npm run dev
# Open http://localhost:3000/dashboard/description-generator
```

## 📝 Form Fields Explained

| Field | Required | Description |
|-------|----------|-------------|
| Business Name | Yes | Your business/brand name |
| Category | Yes | Type of business (e.g., Restaurant, Dermatology) |
| Primary Service | Yes | Main service you offer |
| Secondary Services | No | Additional services (comma-separated) |
| City | Yes | City where business is located |
| Area | No | Specific area/neighborhood |
| State | No | State/Province |
| Target Customers | No | Description of your ideal customer |
| Years in Business | No | How long you've been operating |
| Unique Selling Points | No | What makes you different (comma-separated) |
| Keywords | No | Keywords you want to rank for (comma-separated) |
| Tone | No | Writing tone for descriptions |
| CTA | No | Call-to-action preference |

## 🔌 API Endpoints

### Generate Description
```
POST /api/generate-description
Authorization: Bearer {token}

Body:
{
  "businessName": "The Italian Kitchen",
  "businessCategory": "Restaurant",
  "primaryService": "Italian Pizza",
  "secondaryServices": ["Pasta", "Wine"],
  "city": "Mumbai",
  "area": "Andheri",
  "state": "Maharashtra",
  "targetCustomers": "Food enthusiasts looking for authentic Italian",
  "yearsInBusiness": 5,
  "uniqueSellingPoints": ["Award-winning chef", "Organic ingredients"],
  "keywords": ["authentic", "Italian", "pizza"],
  "tone": "Professional",
  "cta": "Call Now",
  "language": "English",
  "includeLong": true,
  "includeExtraLong": false
}

Response:
{
  "success": true,
  "id": "...",
  "descriptions": {
    "title": "The Italian Kitchen - Authentic Italian Pizza & Pasta in Mumbai",
    "long": "[500-word description]",
    "extraLong": "[750-word description]"
  },
  "analysis": {
    "keywords": ["authentic", "Italian", "pizza", ...],
    "categories": ["Italian Restaurant", "Pizza Place", ...],
    "faqs": ["Q: What cuisines do you serve?\nA: ..."],
    "hashtags": ["#MumbaiFood", "#ItalianCuisine", ...]
    "quality": {
      "seo": 92,
      "readability": 88,
      "keywordUsage": 85,
      "localSeo": 90,
      "cta": 95,
      "trustSignals": 87,
      "overall": 89
    }
  }
}
```

### Get Generation History
```
GET /api/descriptions/history?limit=50&skip=0&search=query
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [...],
  "stats": {
    "total": 15,
    "favorites": 3,
    "avgQualityScore": 88,
    "topCategories": [...]
  },
  "pagination": { "limit": 50, "skip": 0, "hasMore": false }
}
```

### Get Favorite Descriptions
```
GET /api/descriptions/favorites
Authorization: Bearer {token}
```

### Add to Favorites
```
POST /api/descriptions/favorites
Authorization: Bearer {token}

Body: { "descriptionId": "..." }
```

### Remove from Favorites
```
DELETE /api/descriptions/favorites
Authorization: Bearer {token}

Body: { "descriptionId": "..." }
```

### Get Single Description
```
GET /api/descriptions/{id}
Authorization: Bearer {token}
```

### Delete Description
```
DELETE /api/descriptions/{id}
Authorization: Bearer {token}
```

### Update Description (Regenerate)
```
PUT /api/descriptions/{id}
Authorization: Bearer {token}

Body: {
  "longDescription": "[updated description]",
  "seoTitle": "[updated title]",
  "qualityScore": 92
}
```

## 📊 Database Schema

### DescriptionGeneration Collection
```typescript
{
  _id: ObjectId,
  userId: string,
  businessName: string,
  businessCategory: string,
  primaryService: string,
  secondaryServices: [string],
  city: string,
  area: string,
  state: string,
  targetCustomers: string,
  yearsInBusiness: number,
  uniqueSellingPoints: [string],
  keywords: [string],
  tone: string,
  cta: string,
  language: string,
  
  // Generated outputs
  seoTitle?: string,
  shortDescription?: string,      // 80 words
  mediumDescription?: string,     // 250 words
  longDescription?: string,       // 500 words
  extraLongDescription?: string,  // 750 words
  
  // Analysis
  topKeywordsUsed?: [string],
  suggestedCategories?: [string],
  suggestedFaqs?: [string],
  suggestedHashtags?: [string],
  qualityScore?: number,          // 0-100
  qualityMetrics?: {
    seo: number,
    readability: number,
    keywordUsage: number,
    localSeo: number,
    cta: number,
    trustSignals: number
  },
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
  tokenUsage?: number,
  model?: string,
  isFavorite?: boolean,
  regeneratedFromId?: string
}
```

### FavoriteDescription Collection
```typescript
{
  _id: ObjectId,
  userId: string,
  descriptionId: string,
  createdAt: Date
}
```

## 🔒 Security Features

### Authentication
- Requires valid JWT token in Authorization header
- Token extracted from Bearer scheme: `Authorization: Bearer {token}`

### Rate Limiting
- 10 requests per minute per user
- Returns 429 if exceeded
- Easy to upgrade to Redis-based rate limiting

### Input Validation
- All required fields validated
- Arrays validated for type
- Invalid inputs rejected with descriptive errors

### Authorization
- Users can only view/edit their own descriptions
- Ownership verified before delete/update

## 🎨 Frontend Component

Located at: `frontend/app/dashboard/description-generator/page.tsx`

### Features
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Real-time form validation
- Copy-to-clipboard functionality
- Download as TXT file
- Inline history search
- Loading states and error handling

### Dependencies
- React 19
- Next.js 16
- Tailwind CSS
- Lucide React icons

## 🧪 Testing

### Manual Testing Checklist

1. **Form Validation**
   - [ ] Required fields show validation errors
   - [ ] Form disables submit when required fields empty
   - [ ] Array fields parse comma-separated values correctly

2. **Generation**
   - [ ] Description generates within 10 seconds
   - [ ] Generated text matches word count targets
   - [ ] Keywords appear in description
   - [ ] Quality score calculates correctly

3. **History**
   - [ ] Generations save to database
   - [ ] History loads on page open
   - [ ] Search filters results correctly
   - [ ] Delete removes from history

4. **Copy/Download**
   - [ ] Copy button copies text to clipboard
   - [ ] Download creates proper TXT file
   - [ ] Multiple descriptions can be downloaded

5. **Multiple AI Providers**
   - [ ] Anthropic: Test with `AI_PROVIDER=anthropic`
   - [ ] OpenAI: Test with `AI_PROVIDER=openai`
   - [ ] Gemini: Test with `AI_PROVIDER=gemini`
   - [ ] Groq: Test with `AI_PROVIDER=groq`
   - [ ] OpenRouter: Test with `AI_PROVIDER=openrouter`

## 📈 Performance Optimization

### Generation Speed
- Average response time: 8-15 seconds (depends on AI provider)
- Groq: Fastest (3-5 seconds)
- OpenAI/Anthropic: Medium (5-10 seconds)
- Gemini: Slower (10-15 seconds)

### Database Indexes
- `{ userId: 1, createdAt: -1 }` - History retrieval
- `{ businessCategory: 1 }` - Category filtering
- `{ city: 1 }` - Location filtering
- `{ userId: 1, descriptionId: 1 }` - Favorites (unique)

### Caching Opportunities
- Cache business categories list
- Cache common keywords suggestions
- Cache tone/CTA options

## 🚨 Error Handling

All errors return proper HTTP status codes:

| Status | Meaning |
|--------|---------|
| 400 | Validation failed (missing required fields) |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (not the owner of resource) |
| 404 | Not found (description doesn't exist) |
| 409 | Conflict (already in favorites) |
| 429 | Rate limit exceeded |
| 500 | Server error (AI service unavailable) |
| 503 | Service unavailable (AI provider down) |

## 🔄 Future Enhancements

### Planned Features
1. **Regeneration Options**
   - Regenerate with different tone
   - Expand/shorten existing description
   - Improve specific sections

2. **Template Support**
   - Industry-specific templates
   - Custom prompt templates
   - A/B testing templates

3. **Multi-language Support**
   - Hindi, Spanish, French, etc.
   - Auto-translate descriptions
   - Multi-language output

4. **Integration**
   - Direct publish to Google Business Profile
   - Sync with website CMS
   - Email export/scheduling

5. **Analytics**
   - Track description performance
   - Monitor A/B test results
   - Keyword ranking tracking

6. **Advanced Features**
   - Image generation for descriptions
   - Video script generation
   - Competitor comparison reports

## 📞 Support

### Common Issues

**Q: Generation taking too long?**
A: Switch to Groq or OpenRouter for faster responses. Anthropic is most reliable but slower.

**Q: "Rate limit exceeded" error?**
A: You've made more than 10 requests in the last minute. Wait 60 seconds and retry.

**Q: Generated content is too generic?**
A: Provide more details in "Unique Selling Points" and "Keywords" fields.

**Q: Authentication fails?**
A: Ensure you're logged in and have a valid `gmb_auth_token` in localStorage.

## 📚 References

- [Anthropic API Docs](https://docs.anthropic.com)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Google Gemini Docs](https://makersuite.google.com)
- [Groq API Docs](https://console.groq.com/docs)
- [OpenRouter Docs](https://openrouter.ai/docs)

## 📄 License

Part of BizLocalPilot - All rights reserved.
