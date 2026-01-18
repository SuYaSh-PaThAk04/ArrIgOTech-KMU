# Render.com Debugging Steps

## Step 1: Test These URLs in Order

After deploying, test these URLs in your browser or Postman:

### 1. Basic Health Check
```
GET https://your-app.onrender.com/api/health
```
**Expected Response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "environment": "production",
  "timestamp": "2024-12-14T..."
}
```

### 2. Simple Test Route
```
GET https://your-app.onrender.com/api/test
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Test route working",
  "method": "GET",
  "url": "/api/test"
}
```

### 3. Auth Route Test
```
GET https://your-app.onrender.com/api/auth/me
```
**Expected Response:**
```json
{
  "success": false,
  "message": "No token provided"
}
```

### 4. React App
```
GET https://your-app.onrender.com/
```
**Expected:** Your React application should load

## Step 2: Check Render Logs

1. Go to your Render dashboard
2. Click on your service
3. Go to "Logs" tab
4. Look for:
   - ✅ "MongoDB Connected Successfully"
   - ✅ "Server running on port 10000"
   - ❌ Any error messages

## Step 3: Verify Environment Variables

In Render dashboard → Settings → Environment Variables:

**Required Variables:**
- `NODE_ENV` = `production`
- `MONGODB_URI` = `mongodb+srv://username:password@cluster.mongodb.net/dbname`
- `JWT_SECRET` = `your-secret-key-here`
- `PORT` = `10000`

## Step 4: Common Issues & Solutions

### Issue: "Route not found" for ALL routes
**Cause:** Server not starting properly
**Solution:** Check Render logs for startup errors

### Issue: "Route not found" for API routes only
**Cause:** Routes not properly imported
**Solution:** Check server.js imports and route files

### Issue: "Route not found" for React routes
**Cause:** Static file serving not working
**Solution:** Verify build completed successfully

### Issue: Database connection errors
**Cause:** MongoDB URI incorrect or network issues
**Solution:** 
- Use MongoDB Atlas (cloud)
- Whitelist all IPs (0.0.0.0/0) in MongoDB Atlas
- Check connection string format

## Step 5: Manual Testing Commands

Use these curl commands to test your API:

```bash
# Health check
curl https://your-app.onrender.com/api/health

# Test route
curl https://your-app.onrender.com/api/test

# Auth test
curl https://your-app.onrender.com/api/auth/me

# Login test
curl -X POST https://your-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Step 6: What to Report Back

Please tell me:

1. **Which URLs work and which don't**
2. **Exact error messages from Render logs**
3. **Your Render app URL**
4. **Environment variables you've set**

## Quick Fixes to Try

### Fix 1: Redeploy
```bash
git add .
git commit -m "Trigger redeploy"
git push origin main
```

### Fix 2: Clear Build Cache
In Render dashboard:
- Settings → Clear build cache
- Manual Deploy → Deploy latest commit

### Fix 3: Check Build Command
Ensure these are set in Render:
- **Build Command:** `npm run build`
- **Start Command:** `npm start`