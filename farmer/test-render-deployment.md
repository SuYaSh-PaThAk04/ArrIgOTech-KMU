# Render.com Deployment Debug Guide

## Test These URLs After Deployment:

1. **Health Check**: `https://your-app.onrender.com/api/health`
   - Should return: `{"status":"OK","message":"Server is running"}`

2. **Debug Routes**: `https://your-app.onrender.com/api/debug/routes`
   - Should list all available API routes

3. **Auth Test**: `https://your-app.onrender.com/api/auth/me`
   - Should return: `{"success":false,"message":"No token provided"}` (this is expected without auth)

4. **React App**: `https://your-app.onrender.com/`
   - Should serve your React application

## Common Issues:

### Issue 1: Build Fails
**Solution**: Check Render logs for build errors

### Issue 2: Environment Variables Missing
**Solution**: Set these in Render dashboard:
- `NODE_ENV=production`
- `MONGODB_URI=your_mongodb_atlas_connection_string`
- `JWT_SECRET=your_secret_key`

### Issue 3: Database Connection Fails
**Solution**: 
- Use MongoDB Atlas (not local MongoDB)
- Whitelist Render's IP addresses in MongoDB Atlas
- Check connection string format

### Issue 4: API Routes Return 404
**Solution**: 
- Ensure all route files exist and are properly imported
- Check server logs for import errors
- Verify route paths match your API calls

## Debug Steps:

1. **Check Render Logs**:
   - Go to your Render dashboard
   - Click on your service
   - Check "Logs" tab for errors

2. **Test API Endpoints**:
   - Use Postman or curl to test individual endpoints
   - Start with `/api/health` endpoint

3. **Verify Environment**:
   - Check if `NODE_ENV=production` is set
   - Verify all required environment variables are present

## Quick Fix Commands:

If you need to redeploy quickly:

```bash
# Add a small change to trigger redeploy
echo "# Updated $(date)" >> README.md
git add .
git commit -m "Trigger redeploy"
git push origin main
```