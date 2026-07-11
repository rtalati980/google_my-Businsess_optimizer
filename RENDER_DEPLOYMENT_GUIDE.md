# 🚀 Render.com Deployment Guide

## Step 1: Prepare Your Repository

Make sure `.env` is in `.gitignore` (it should be):

```bash
# Check .gitignore
grep -i "^\.env$" .gitignore
```

Your `.env` file contains sensitive credentials and should NEVER be committed to Git.

## Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up (GitHub, GitLab, or email)
3. Create a new project/organization

## Step 3: Deploy Backend (Spring Boot)

### Option A: Using render.yaml (Recommended)

1. Connect your GitHub repository
2. Render will detect `render.yaml` automatically
3. Proceed to "Set Environment Variables"

### Option B: Manual Setup

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Fill in the form:
   - **Name**: `gmb-backend`
   - **Branch**: `main`
   - **Runtime**: `Java`
   - **Build Command**: `cd backend && mvn clean package -DskipTests`
   - **Start Command**: `cd backend && java -jar target/manager-*.jar`
   - **Plan**: Standard or higher

## Step 4: Set Backend Environment Variables

In Render dashboard, go to your service → Environment:

### Required Variables

```env
SPRING_PROFILES_ACTIVE=prod
GOOGLE_API_MODE=PRODUCTION
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gmbai
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
JWT_SECRET=your-secure-jwt-secret-32-chars-minimum
ANTHROPIC_API_KEY=sk-ant-your-key
```

### How to Get Each Variable

**MONGODB_URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Format: `mongodb+srv://user:password@cluster.mongodb.net/gmbai`

**GOOGLE_CLIENT_ID & SECRET:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add Render domain to authorized redirect URIs
4. Copy Client ID and Secret

**JWT_SECRET:**
```bash
# Generate secure secret
openssl rand -base64 32
```

**ANTHROPIC_API_KEY:**
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create API key
3. Copy and paste

## Step 5: Deploy Frontend (Next.js)

### Option A: Netlify (Recommended for Frontend Only)

1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repository
3. Build settings:
   - **Build command**: `cd frontend && npm run build`
   - **Publish directory**: `frontend/.next`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = Your Render backend URL

### Option B: Render Web Service

1. Click "New +" → "Web Service"
2. Connect GitHub repository
3. Fill in:
   - **Name**: `gmb-frontend`
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Start Command**: `cd frontend && npm start`

4. Environment variables:
   - `NODE_ENV=production`
   - `NEXT_PUBLIC_API_URL=https://gmb-backend.onrender.com`

## Step 6: Connect Frontend to Backend

After backend deploys, update frontend environment:

1. Get backend URL from Render dashboard
2. In frontend service → Environment
3. Set `NEXT_PUBLIC_API_URL=<backend-url>`
4. Redeploy frontend

## Step 7: Configure CORS

The backend automatically configures CORS for production. Make sure:

1. Backend receives correct `FRONTEND_URL`
2. This is automatically set from Render inter-service communication

## Step 8: Verify Deployment

### Check Backend Health
```bash
curl https://gmb-backend.onrender.com/actuator/health
```

Expected response:
```json
{
  "status": "UP"
}
```

### Check Frontend
Visit `https://gmb-frontend.onrender.com` and verify:
- Page loads
- Dashboard visible
- No console errors

### Test API Connection
1. Go to frontend
2. Click "Continue with Google"
3. Check if OAuth flow works
4. Verify API calls in Network tab

## Step 9: Set Up Database (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist Render IP addresses:
   - Go to Security → Network Access
   - Add IP address `0.0.0.0/0` (or specific Render IPs)
5. Get connection string
6. Add to backend environment variables

## Step 10: Configure Custom Domain (Optional)

### Backend
1. In Render, go to Service Settings
2. Add custom domain (e.g., `api.yourdomain.com`)
3. Add CNAME record to your DNS

### Frontend
1. Use Netlify or Render same process
2. Add custom domain (e.g., `yourdomain.com`)

## Troubleshooting

### "No .env file found" Error
**Solution**: Environment variables must be set in Render dashboard, not in .env file

### Build Fails with Compilation Error
**Solution**: 
```bash
# Ensure Maven is installed
mvn --version

# Run locally
cd backend
mvn clean package -DskipTests
```

### API 401 Unauthorized
**Solution**: 
- Check JWT_SECRET is set correctly
- Make sure it's the same on both services
- Verify authentication token is being sent

### CORS Error
**Solution**:
- Check FRONTEND_URL is set correctly
- Verify backend CORS configuration
- Clear browser cache

### Database Connection Error
**Solution**:
1. Verify MONGODB_URI is correct
2. Check IP whitelist in MongoDB Atlas
3. Verify database credentials
4. Test connection locally

### Build Timeout
**Solution**:
- Upgrade to Standard plan or higher
- Check for large dependencies
- Run `npm ci` instead of `npm install`

## Monitoring

### Logs
1. In Render dashboard
2. Click service → Logs
3. Check for errors

### Metrics
1. Service → Metrics
2. Monitor CPU, memory, requests

### Alerts
1. Service → Notifications
2. Set up alerts for failures

## Updates & Redeployment

### Deploy New Version
1. Push changes to GitHub
2. Render automatically redeploys on push
3. Monitor Logs to verify

### Manual Redeploy
1. Service → Settings
2. Click "Manual Deploy"
3. Select branch and deploy

## Environment Variable Reference

| Variable | Example | Required | Notes |
|----------|---------|----------|-------|
| SPRING_PROFILES_ACTIVE | prod | Yes | Production profile |
| MONGODB_URI | mongodb+srv://... | Yes | Database URL |
| GOOGLE_CLIENT_ID | ...apps.googleusercontent.com | Yes | OAuth credential |
| GOOGLE_CLIENT_SECRET | GOCSPX-... | Yes | OAuth credential |
| JWT_SECRET | 32+ character string | Yes | Generate with openssl |
| ANTHROPIC_API_KEY | sk-ant-... | Yes | From Anthropic console |
| GOOGLE_API_MODE | PRODUCTION | Yes | API mode |
| FRONTEND_URL | https://frontend.onrender.com | Yes | Frontend domain |
| NEXT_PUBLIC_API_URL | https://backend.onrender.com | Yes | Backend URL for frontend |
| NODE_ENV | production | Yes | Node environment |

## Cost Optimization

### Free Tier
- ✅ Works for development/testing
- ⚠️ Services spin down after 15 min inactivity
- ⚠️ Limited CPU/memory

### Paid Tier (Recommended)
- ✅ Starter plan: $7/month per service
- ✅ Standard plan: $12/month per service
- ✅ Always running
- ✅ Better performance
- ✅ SLA support

## Security Best Practices

1. **Never commit .env file**
   ```bash
   # Verify .env is in .gitignore
   cat .gitignore | grep "^\.env$"
   ```

2. **Use environment variables for secrets**
   - Never hardcode credentials
   - Use Render's environment variable dashboard

3. **Use HTTPS only**
   - Render provides free HTTPS
   - Enable automatic redirects

4. **Rotate secrets regularly**
   - JWT_SECRET every 90 days
   - API keys every 6 months

5. **Monitor access logs**
   - Check Render logs regularly
   - Set up alerts

## Support & Resources

- [Render Documentation](https://render.com/docs)
- [Spring Boot on Render](https://render.com/docs/deploy-spring-boot)
- [Next.js on Render](https://render.com/docs/deploy-next-js)
- [MongoDB Atlas Setup](https://docs.mongodb.com/atlas/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)

---

**Status**: ✅ Ready for Production Deployment

Deploy with confidence! Your application is fully configured for Render.
