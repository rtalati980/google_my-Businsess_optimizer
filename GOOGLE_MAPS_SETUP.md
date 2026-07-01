# 🗺️ Google Maps Real-Time Integration Guide

Your telecaller portal can now fetch **REAL businesses directly from Google Maps** with zero backend!

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Free Google Places API Key

1. Go to: **[console.cloud.google.com](https://console.cloud.google.com)**
2. Create a new project (or use existing)
3. Search for **"Places API"** → Enable it
4. Search for **"Maps JavaScript API"** → Enable it
5. Go to **Credentials** → **Create API Key**
6. Copy your API key (looks like: `AIzaSyDxxxxxxxxxxxx`)

### Step 2: Open Telecaller Portal
Open `frontend/public/telecaller.html` in your browser

### Step 3: Switch to Google Maps Tab
Click the **🗺️ Google Maps (Real-Time)** tab

### Step 4: Configure
1. **Paste API Key** into the "Google Places API Key" field
2. **Enter Location** (e.g., "Mumbai, India")
3. **Select Search Type** (Dental, Restaurant, Beauty Salon, etc.)
4. **Set Number of Results** (5-50)

### Step 5: Fetch!
Click **🗺️ Fetch From Google Maps**

✅ Done! Get real businesses with verified phone numbers & ratings!

---

## 📍 What You Get

Real data from Google Maps for each business:

✓ **Business Name** - Exact name from Google  
✓ **Phone Number** - Verified contact number  
✓ **Website** - If listed on Google  
✓ **Address** - Full location  
✓ **Ratings** - Google star rating  
✓ **Review Count** - Number of customer reviews  
✓ **Business Type** - Category (Clinic, Restaurant, Shop, etc.)  

---

## 🎯 Search Types Available

| Type | Fetches | Best For |
|------|---------|----------|
| **Dental** | Dental clinics, dentists | Mediva360 pitch |
| **Doctor** | Hospitals, clinics, doctors | Medical products |
| **Restaurant** | Restaurants, cafes, bars | Website builders |
| **Beauty** | Salons, spas, parlours | Beauty service packages |
| **Gym** | Fitness centers, gyms | Health/wellness pitches |
| **Shop** | Retail stores, shops | CRM software pitch |
| **Hotel** | Hotels, resorts | Hospitality services |
| **Business** | All business types | General B2B |

---

## 💰 Cost

✅ **FREE** - Google gives you:
- 150 free text search requests/month
- Enough for testing and small-scale use
- Pay only if you exceed limits ($0.03 per request)

---

## 📱 Example Workflow

### Search for Dental Clinics in Mumbai

1. **Location:** Mumbai, India
2. **Search Type:** Dental
3. **Results:** 30

**Gets you:**
- 30 real dental clinics from Google Maps
- Phone numbers (verified)
- Websites (if they have one)
- Star ratings & review counts
- Full addresses

Then you can:
- Filter by website status
- Search for specific clinics
- Call directly using the phone links
- Send emails/WhatsApp from portal
- Log outcomes and schedule callbacks

---

## 🔒 API Key Security

⚠️ **Important:**
- Your API key is used **only in your browser** (not sent to any server)
- It's stored in browser memory during the session
- Each browser gets its own key (not shared)
- You can restrict the key in Google Console to specific apps

**Optional:** Restrict your API key in Google Console:
- Go to Credentials → Select your key
- Under "Application Restrictions" → HTTP referrers (websites)
- Add: `localhost`, `file://`, or your domain
- This prevents abuse if key is exposed

---

## ❌ Troubleshooting

### "Failed to load Google Maps API"
**Solution:**
- Check API key is correct (starts with `AIzaSy`)
- Verify **Places API** is enabled in console.cloud.google.com
- Verify **Maps JavaScript API** is enabled

### "No results found"
**Solution:**
- Try a different location format: "City, Country" (e.g., "Pune, India")
- Change search type
- Increase result count
- Check your API quota hasn't been exceeded

### "Permission denied" or 403 error
**Solution:**
- Check API key is enabled for both:
  - ✓ Places API
  - ✓ Maps JavaScript API
- Wait a few minutes after enabling APIs
- Try a different browser/private window

### "Invalid API Key"
**Solution:**
- Copy the full key again (sometimes spaces get copied)
- Ensure no extra spaces at beginning/end
- Generate a new key if needed

---

## 📊 Cost Estimation

| Monthly Searches | API Cost |
|------------------|----------|
| 0-150 | FREE ✓ |
| 150-500 | ~$10.50 |
| 500-1000 | ~$25.50 |
| 1000-5000 | ~$127.50 |

Most small teams stay in the **free tier** (0-150/month).

---

## 🎓 Advanced Tips

### Combine Multiple Searches
1. Search "Dental Clinics in Mumbai" → Export CSV
2. Search "Dental Clinics in Pune" → Export CSV
3. Combine CSVs for multi-city outreach

### Filter After Import
- Use portal's filter: "Missing Website" to find leads without sites (perfect for web design pitch)
- Filter by "Unclaimed Profile" to find businesses missing Google optimization

### Export & Reuse
Click **📥 Export Leads CSV** to:
- Save for records
- Share with team
- Bulk upload later
- Use in other tools

---

## 🚀 That's It!

You now have a **free, real-time lead generation tool** powered by Google Maps, built into your browser. No server, no monthly fees, just pure data from Google.

**Happy hunting! 🎯**

---

## Quick Command Reference

```
Location: "City, Country"
Examples:
- Mumbai, India
- New York, USA
- London, UK
- Singapore, Singapore
- Bangkok, Thailand

Search Types:
- Dental, Doctor, Restaurant, Beauty, Gym, Shop, Hotel, Business
```

---

## Support

If API key issues persist:
1. Create a new API key in console.cloud.google.com
2. Wait 2-3 minutes for it to activate
3. Paste the new key
4. Try again

That usually fixes it! 🔧
