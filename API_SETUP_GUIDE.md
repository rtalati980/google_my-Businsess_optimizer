# Self-Hosted API Integration Guide for Telecaller Portal

## Overview
Your Spring Boot backend is now equipped with a **real-time Lead API** that serves live lead data from PostgreSQL to the Telecaller Portal. This guide shows how to set it up and use it.

---

## Backend Setup

### 1. **Database Migration** (Automated)
The Flyway migration file has been created at:
```
backend/src/main/resources/db/migration/V4__Create_Leads_Table.sql
```

This will automatically create the `leads` table when your Spring Boot app starts. It includes:
- All necessary columns (name, phone, email, type, city, area, product, website status, etc.)
- Indexes for fast filtering by city, product, status, type
- Timestamps for created/updated tracking

### 2. **Run Your Spring Boot Backend**

Start your backend server:
```bash
cd backend
mvn spring-boot:run
```

Or using Docker:
```bash
docker-compose up -d
```

The API will be available at: `http://localhost:8080/api/leads`

---

## API Endpoints

Your backend now exposes these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | Get all leads |
| GET | `/api/leads/{id}` | Get single lead by ID |
| GET | `/api/leads/city/{city}` | Filter leads by city |
| GET | `/api/leads/product/{product}` | Filter leads by product |
| GET | `/api/leads/status/{status}` | Filter leads by call status |
| GET | `/api/leads/search?q=term` | Search leads by name/phone/area |
| GET | `/api/leads/city/{city}/product/{product}` | Filter by both city & product |
| GET | `/api/leads/city/{city}/recent?limit=50` | Get recent leads from a city |
| POST | `/api/leads` | Create new lead |
| PUT | `/api/leads/{id}` | Update existing lead |
| DELETE | `/api/leads/{id}` | Delete lead |

---

## Using the Telecaller Portal

### Step 1: Open the Portal
Open `frontend/public/telecaller.html` in your browser.

### Step 2: Switch to "Self-Hosted API" Tab
Click the **🚀 Self-Hosted API (Real-Time)** tab in the PROSPECTING ENGINE section.

### Step 3: Configure API URL
Enter your backend URL in the **API ENDPOINT URL** field:
```
http://localhost:8080/api/leads
```

Or for remote:
```
https://your-domain.com/api/leads
```

### Step 4: Filter & Fetch
1. **Optional:** Select a specific city and product to filter
2. Click **🚀 Fetch from Self-Hosted API**
3. The portal will load real-time leads from your database

---

## Adding Real Leads to Your Database

### Option A: Direct SQL Insert
```sql
INSERT INTO leads (name, type, city, area, contact, phone, email, product, has_website, gbp, size, status)
VALUES (
  'Sunrise Dental Clinic',
  'Dental Clinic',
  'Mumbai',
  'Andheri West',
  'Dr. Rajesh Kumar',
  '9988998899',
  'contact@sunrisedental.com',
  'Mediva360',
  true,
  'Claimed & Optimized',
  'Medium',
  'Pending'
);
```

### Option B: Using the Portal's POST Endpoint
Create a simple curl command or JavaScript to add leads:
```bash
curl -X POST http://localhost:8080/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sunrise Dental Clinic",
    "type": "Dental Clinic",
    "city": "Mumbai",
    "area": "Andheri West",
    "contact": "Dr. Rajesh Kumar",
    "phone": "9988998899",
    "email": "contact@sunrisedental.com",
    "product": "Mediva360",
    "hasWebsite": true,
    "gbp": "Claimed & Optimized",
    "size": "Medium",
    "status": "Pending"
  }'
```

### Option C: Batch Import from CSV
You can still use the **📎 Import CSV File** tab to upload CSV files.

---

## Features Included

✅ **Real-Time Data Sync** - Changes in the database instantly reflect in the portal
✅ **Smart Filtering** - Filter by city, product, website status, Google listing status
✅ **Full CRUD** - Create, read, update, delete leads
✅ **Search Functionality** - Quick search by name, phone, area, niche
✅ **Call Tracking** - Log call outcomes, callbacks, durations, notes
✅ **Auto-Save** - All updates automatically saved to browser cache (dual persistence)
✅ **CORS Enabled** - Works cross-domain (localhost or remote)

---

## Troubleshooting

### Problem: "Failed to fetch from API"
**Solution:**
1. Check if backend is running: `http://localhost:8080/api/leads` in browser
2. Ensure CORS is enabled (already configured in LeadController)
3. Check backend logs for errors

### Problem: "No leads found"
**Solution:**
1. Add test leads to the database (see "Adding Real Leads" section above)
2. Check if filters (city/product) are too restrictive
3. Verify the API URL is correct

### Problem: Database migration didn't run
**Solution:**
1. Check Flyway migration logs
2. Ensure PostgreSQL is running
3. Manually run V4__Create_Leads_Table.sql if needed

---

## Configuration Files Created

```
backend/src/main/java/com/gmb/manager/
├── entity/Lead.java                    # JPA entity for leads table
├── repository/LeadRepository.java       # Database access layer
├── service/LeadService.java             # Business logic
└── controller/LeadController.java       # REST API endpoints

backend/src/main/resources/db/migration/
└── V4__Create_Leads_Table.sql          # Database schema

frontend/public/
└── telecaller.html                      # Updated portal with API integration
```

---

## Next Steps

1. **Run your Spring Boot backend** (it will auto-create the leads table)
2. **Add test leads** to your PostgreSQL database
3. **Open telecaller.html** in a browser
4. **Switch to "Self-Hosted API" tab** and fetch your real leads
5. **Start managing outreach** with real data!

---

## Demo: Adding 5 Test Leads via SQL

```sql
INSERT INTO leads (name, type, city, area, contact, phone, email, product, has_website, gbp, size, status) VALUES
('Sunrise Dental Clinic', 'Dental Clinic', 'Mumbai', 'Andheri West', 'Dr. Rajesh Kumar', '9988998899', 'contact@sunrisedental.com', 'Mediva360', true, 'Claimed & Optimized', 'Medium', 'Pending'),
('Modern Fashion Store', 'Boutique', 'Mumbai', 'Bandra West', 'Ms. Priya Sharma', '9876543210', 'priya@fashionstore.com', 'CRM Software', false, 'Unclaimed ⚠️', 'Small', 'Pending'),
('Gourmet Restaurant', 'Restaurant', 'Pune', 'Koregaon Park', 'Mr. Amit Desai', '9123456789', 'reservations@gourmet.com', 'Website', true, 'Needs Reviews ⚠️', 'Large', 'Pending'),
('ABC IT Solutions', 'Tech Consultancy', 'Bengaluru', 'Whitefield', 'Mr. Vikram Patel', '9111111111', 'info@abcit.com', 'CRM Software', true, 'Claimed & Optimized', 'Large', 'Pending'),
('Health Plus Clinic', 'General Clinic', 'Hyderabad', 'Jubilee Hills', 'Dr. Sneha Reddy', '9222222222', 'appointments@healthplus.com', 'Mediva360', true, 'Claimed & Optimized', 'Medium', 'Pending');
```

Run this in your PostgreSQL database to populate test data.

---

## Need Help?

- **Backend Issues?** Check `backend/backend.log`
- **Database Issues?** Verify PostgreSQL connection in `application.properties`
- **API Not Responding?** Ensure port 8080 is not blocked
- **CORS Errors?** They're already handled in the controller

---

**Your self-hosted real-time lead management system is ready! 🚀**
