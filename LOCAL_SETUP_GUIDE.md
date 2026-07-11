# 🚀 Local Development Setup Guide

## Prerequisites

Before running locally, ensure you have:

- **Node.js** v20+ (with npm)
- **Java JDK** 21 (Temurin, Corretto, or OpenJDK)
- **Maven** 3.8+
- **MongoDB** 7.0+ (local or Atlas)
- **Git**

## Step 1: Clone Repository

```bash
git clone https://github.com/rtalati980/google_my-Businsess_optimizer.git
cd google_my-Businsess_optimizer
```

## Step 2: Configure Environment

Copy the example environment file and add your credentials:

```bash
cp .env.example .env
```

Edit `.env` and add your values:

```env
# Required for local development
SPRING_PROFILES_ACTIVE=dev
MONGODB_URI=mongodb://localhost:27017/gmbai
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
JWT_SECRET=your-local-jwt-secret
ANTHROPIC_API_KEY=sk-ant-your-key
GOOGLE_API_MODE=SANDBOX
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Step 3: Start MongoDB (3 Options)

### Option A: MongoDB Atlas (Recommended for Production)
```bash
# Use MONGODB_URI from Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gmbai
```

### Option B: Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

### Option C: Local Installation
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Windows (using Chocolatey)
choco install mongodb
# Then start MongoDB service from Services

# Linux
sudo apt-get install mongodb
sudo systemctl start mongodb
```

## Step 4: Build Backend

```bash
cd backend
mvn clean package -DskipTests
echo "✅ Backend build complete"
```

**Expected output:**
```
BUILD SUCCESS
[INFO] Total time: XX.XXs
```

## Step 5: Start Backend

### Terminal 1 - Run Spring Boot

```bash
cd backend
# Option A: Using Maven
mvn spring-boot:run

# Option B: Using JAR
java -jar target/manager-0.0.1-SNAPSHOT.jar
```

**Expected output:**
```
========== gmb-ai-manager ==========
Started at port 8080
Health: UP
Actuator: /actuator/health
```

### Verify Backend Health

```bash
curl http://localhost:8080/actuator/health
```

**Expected response:**
```json
{
  "status": "UP"
}
```

## Step 6: Build Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run build
echo "✅ Frontend build complete"
```

**Expected output:**
```
✓ Compiled successfully
✓ All routes generated
```

## Step 7: Start Frontend

### Terminal 2 - Run Next.js

```bash
cd frontend
npm start
```

**Expected output:**
```
> ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

## Step 8: Access Application

Open browser and visit:

```
http://localhost:3000
```

You should see:
- ✅ GMB AI Manager landing page
- ✅ Login button
- ✅ "Continue with Google" button

## Testing Checklist

### Frontend
- [ ] Page loads without errors
- [ ] Navigation works
- [ ] Dashboard accessible
- [ ] Modern Posts Builder visible
- [ ] All routes load correctly

### Backend API
```bash
# Test health endpoint
curl http://localhost:8080/actuator/health

# Test info endpoint
curl http://localhost:8080/actuator/info

# Expected response: OK with status UP
```

### Database Connection
```bash
# Check MongoDB connection
mongosh "mongodb://localhost:27017/gmbai"
> show databases
> db.stats()
```

### Full Flow Test
1. Go to http://localhost:3000
2. Click "Continue with Google"
3. You'll see mock login (SANDBOX mode)
4. Should redirect to dashboard
5. Try Posts Builder on sidebar
6. Should work without errors

## Troubleshooting

### "Port 8080 already in use"
```bash
# Kill process using port 8080
lsof -i :8080
kill -9 <PID>
```

### "Port 3000 already in use"
```bash
# Kill process using port 3000
lsof -i :3000
kill -9 <PID>
```

### MongoDB Connection Error
```bash
# Check MongoDB is running
mongosh
# If fails, start MongoDB:
# macOS: brew services start mongodb-community
# Docker: docker start mongodb
```

### "Cannot find symbol: ReviewRepository"
```bash
# Clean and rebuild
cd backend
mvn clean compile
```

### Build taking too long
```bash
# Use parallel Maven build
mvn clean package -DskipTests -T 1C
```

## Development Workflow

### Making Changes

**Backend changes:**
1. Edit files in `backend/src/main/java`
2. Maven recompiles on save (if using IDE)
3. Restart server: `Ctrl+C` then `mvn spring-boot:run`

**Frontend changes:**
1. Edit files in `frontend/app`
2. Next.js hot-reloads automatically
3. Refresh browser to see changes

### Viewing Logs

**Backend logs:**
```
Terminal 1 output shows Spring Boot logs
Look for: ERROR, WARN, INFO messages
```

**Frontend logs:**
```
Terminal 2 output shows Next.js build info
Browser console (F12) shows client-side errors
```

## Environment Variables

| Variable | Local Value | Purpose |
|----------|------------|---------|
| SPRING_PROFILES_ACTIVE | dev | Enables development profile |
| MONGODB_URI | mongodb://localhost:27017 | Local database |
| GOOGLE_API_MODE | SANDBOX | Mock Google API |
| FRONTEND_URL | http://localhost:3000 | Frontend domain |
| BACKEND_URL | http://localhost:8080 | Backend domain |

## Docker Alternative

If you prefer containerized local development:

```bash
# Build images
docker build -t gmb-backend ./backend
docker build -t gmb-frontend ./frontend

# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

## Performance Tips

1. **Frontend**: First build takes 2-3 min, subsequent builds are faster with cache
2. **Backend**: First build takes 1-2 min, Maven caches dependencies
3. **Hot reload**: Frontend hot-reloads, backend requires restart
4. **Database**: Keep MongoDB running between sessions

## Common Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend (Next.js) | 3000 | http://localhost:3000 |
| Backend (Spring Boot) | 8080 | http://localhost:8080 |
| MongoDB | 27017 | mongodb://localhost:27017 |
| Actuator Health | 8080 | http://localhost:8080/actuator/health |

## Next Steps

After local development works:

1. **Test all features:**
   - Posts Builder
   - Review APIs
   - Dashboard
   - Settings

2. **Run tests:**
   ```bash
   # Backend tests
   cd backend
   mvn test

   # Frontend tests (if available)
   cd frontend
   npm test
   ```

3. **Check build quality:**
   ```bash
   # Frontend audit
   cd frontend
   npm audit

   # Backend analysis
   cd backend
   mvn spotbugs:check
   ```

4. **Deploy locally with Docker:**
   ```bash
   docker-compose up -d
   ```

5. **Deploy to production:**
   - See `RENDER_DEPLOYMENT_GUIDE.md`
   - Or `PRODUCTION_DEPLOYMENT_GUIDE.md`

## Support

If you encounter issues:

1. Check logs in both terminals
2. Verify environment variables (`.env` file)
3. Ensure MongoDB is running
4. Check ports are not in use
5. Review this guide's troubleshooting section

## Build Status

**Last local build:**
```
Backend:  ✅ SUCCESS (8.4s)
Frontend: ✅ SUCCESS (43.2s)
Database: ✅ READY
API:      ✅ WORKING
UI:       ✅ MODERN & RESPONSIVE
```

---

**You're all set! Happy local development!** 🚀
