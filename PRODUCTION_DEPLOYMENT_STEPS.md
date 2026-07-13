# 🚀 PRODUCTION DEPLOYMENT - COMPLETE STEPS

## Status: READY TO DEPLOY ✅

**Your application is production-ready with:**
- Backend: Spring Boot 3.4 (Java 21) ✅
- Frontend: Next.js 16 with Turbopack ✅
- Database: MongoDB Atlas ✅
- AI: Anthropic Claude API ✅
- Security: JWT + OAuth2 + CORS ✅

---

## 🎯 DEPLOYMENT STRATEGY

### Option 1: RENDER.COM (Easiest) ⭐ RECOMMENDED
- Automatic deployments from GitHub
- Built-in SSL/HTTPS
- Health checks included
- Cost: ~$12-15/month

### Option 2: Docker Deployment
- Self-hosted or any Docker registry
- Full control
- Can use AWS ECS, DigitalOcean, etc.

---

## 📋 STEP 1: PREPARE REPOSITORY

```bash
# Verify .env is NOT committed
git status | grep -i env  # Should show nothing

# Verify all changes are committed
git status  # Should show "nothing to commit"

# Push to GitHub
git push origin main
```

---

## 🔧 STEP 2: GET YOUR CREDENTIALS

### MongoDB Atlas
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create free cluster or use existing
3. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/gmbai`
4. Save as: `MONGODB_URI`

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 Web Application credentials
3. Add Render domains to authorized URIs:
   - `https://gmb-backend-xxx.onrender.com/oauth2/callback/google`
   - `https://gmb-frontend-xxx.onrender.com/callback`
4. Save:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

### Anthropic API
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create API key
3. Save as: `ANTHROPIC_API_KEY`

### JWT Secret
```bash
# Generate secure secret
openssl rand -base64 32
# Example: ABC123def456GHI789JKL012mno345PQR678
```

---

## 🎬 STEP 3: DEPLOY TO RENDER.COM

### Step 3a: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize your GitHub account

### Step 3b: Deploy Backend First

1. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Select `google_my-Business_optimizer`

2. **Configure Service**
   - **Name**: `gmb-backend`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Java`
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/manager-*.jar`
   - **Plan**: `Standard` ($12/month)

3. **Set Environment Variables** (in Render dashboard)
   ```
   SPRING_PROFILES_ACTIVE=prod
   GOOGLE_API_MODE=PRODUCTION
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gmbai
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
   JWT_SECRET=your-generated-secret-32-chars
   ANTHROPIC_API_KEY=sk-ant-your-key
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for build & deployment
   - Check: `https://gmb-backend-xxx.onrender.com/actuator/health`
   - Should return: `{"status":"UP"}`

### Step 3c: Deploy Frontend

1. **Create Another Web Service**
   - Click "New +" → "Web Service"
   - Same repo, different service

2. **Configure Service**
   - **Name**: `gmb-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Standard` ($12/month)

3. **Set Environment Variables**
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://gmb-backend-xxx.onrender.com
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes
   - Check: `https://gmb-frontend-xxx.onrender.com`
   - Should load login page

---

## ✅ STEP 4: VERIFY DEPLOYMENT

### Test Backend Health
```bash
curl https://gmb-backend-xxx.onrender.com/actuator/health
# Expected: {"status":"UP"}
```

### Test Frontend
1. Open: `https://gmb-frontend-xxx.onrender.com`
2. Should see login page with "Try Demo (Sandbox Mode)"
3. Click "Try Demo" → should redirect to dashboard
4. Should see business metrics and dashboard

### Test API
1. Open browser DevTools (F12)
2. Network tab
3. Click "Try Demo"
4. Should see POST to `/api/auth/mock-login`
5. Status: 200 OK
6. Response: `{"token":"eyJ..."}`

---

## 🎯 STEP 5: PRODUCTION OPTIMIZATION

### Custom Domain (Optional)
```bash
# For backend
# 1. Go to Render → gmb-backend → Settings
# 2. Add Custom Domain: api.yourdomain.com
# 3. Add CNAME record in DNS:
#    api.yourdomain.com CNAME gmb-backend-xxx.onrender.com

# For frontend
# 1. Go to Render → gmb-frontend → Settings
# 2. Add Custom Domain: yourdomain.com
# 3. Add CNAME record in DNS:
#    yourdomain.com CNAME gmb-frontend-xxx.onrender.com
```

### Enable Auto-Deploy
- Already enabled! Render auto-deploys on git push
- Just push to GitHub, Render deploys automatically

### Monitor Production
1. Render Dashboard → Services
2. Check logs: "Logs" tab
3. View metrics: "Metrics" tab
4. Set up alerts: "Notifications"

---

## 📊 COST BREAKDOWN

| Component | Plan | Cost/Month | Notes |
|-----------|------|-----------|-------|
| Backend | Standard | $12 | Always running |
| Frontend | Standard | $12 | Always running |
| MongoDB | Free | $0 | 512MB free tier |
| **TOTAL** | | **$24/mo** | ✅ Production ready |

---

## 🔒 SECURITY CHECKLIST

- [x] `.env` NOT in git
- [x] Environment variables set in Render dashboard
- [x] HTTPS enabled (auto)
- [x] JWT tokens used for auth
- [x] CORS configured
- [x] Spring Security 6 hardened
- [x] Logging configured

---

## 🚨 TROUBLESHOOTING

### Backend won't start
```
Check:
1. MONGODB_URI is correct
2. ANTHROPIC_API_KEY is valid
3. JWT_SECRET is set
4. Build logs for compile errors
```

### Frontend shows blank page
```
Check:
1. NEXT_PUBLIC_API_URL is correct
2. Backend is running
3. CORS headers in network tab
4. Browser console for errors
```

### Login fails with "Network Error"
```
Check:
1. Backend is running and healthy
2. NEXT_PUBLIC_API_URL points to correct backend
3. Network tab shows request to backend
4. Backend logs for errors
```

### OAuth doesn't work
```
Check:
1. Authorized redirect URIs in Google Cloud
2. GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET match Google Cloud
3. Frontend callback URL is correct
```

---

## 📞 SUPPORT

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Spring Boot Docs**: [spring.io](https://spring.io)
- **Next.js Docs**: [nextjs.org](https://nextjs.org)
- **MongoDB Docs**: [mongodb.com/docs](https://mongodb.com/docs)

---

## ✨ FINAL STATUS

```
✅ Backend:       Production-ready (compiled & optimized)
✅ Frontend:      Production-ready (all routes built)
✅ Database:      MongoDB Atlas configured
✅ API:           Anthropic Claude integrated
✅ Security:      JWT + OAuth2 + CORS
✅ Deployment:    render.yaml configured
✅ Documentation: Complete

🎉 READY FOR PRODUCTION DEPLOYMENT
```

---

**Next Action**: Follow STEP 1-5 above to deploy to Render.com
**Estimated Time**: 30 minutes
**Cost**: $24/month (or free tier for testing)
