# Deployment Guide - PropertyShare Pro

## 🗄️ Step 1: MongoDB Atlas (Database)

1. **Create Account**: Go to https://www.mongodb.com/cloud/atlas/register
2. **Create Cluster**: 
   - Choose FREE M0 tier
   - Select region closest to you
   - Click "Create Cluster"
3. **Create Database User**:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `propertyshare_admin`
   - Generate secure password (SAVE THIS!)
   - Database User Privileges: "Atlas admin"
4. **Network Access**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm
5. **Get Connection String**:
   - Go to "Database" → Click "Connect"
   - Choose "Drivers"
   - Copy connection string (looks like):
     ```
     mongodb+srv://propertyshare_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://propertyshare_admin:<password>@cluster0.xxxxx.mongodb.net/propertyshare-pro?retryWrites=true&w=majority`

---

## 🚀 Step 2: Backend Deployment (Render)

1. **Push to GitHub**:
   ```bash
   cd d:/Property-Pro
   git init
   git add .
   git commit -m "Initial commit"
   # Create repo on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/property-pro.git
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Go to https://render.com → Sign up/Login
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `propertyshare-pro-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: `Free`
   
3. **Environment Variables** (Add these in Render dashboard):
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://propertyshare_admin:<password>@cluster0.xxxxx.mongodb.net/propertyshare-pro?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-random-string-change-this-123456789
   JWT_EXPIRE=7d
   FRONTEND_URL=https://your-app.vercel.app
   ```

4. **Deploy**: Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your backend URL: `https://propertyshare-pro-backend.onrender.com`

5. **Seed Database**:
   - After deployment, go to Render dashboard
   - Click "Shell" tab
   - Run: `node src/seed.js`

---

## 🎨 Step 3: Frontend Deployment (Vercel)

1. **Update Frontend Environment**:
   - Edit `frontend/.env`:
     ```
     VITE_API_URL=https://propertyshare-pro-backend.onrender.com/api
     ```

2. **Deploy on Vercel**:
   - Go to https://vercel.com → Sign up/Login
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   
3. **Environment Variables** (Add in Vercel):
   ```
   VITE_API_URL=https://propertyshare-pro-backend.onrender.com/api
   ```

4. **Deploy**: Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - Copy your frontend URL: `https://your-app.vercel.app`

5. **Update Backend CORS**:
   - Go back to Render dashboard
   - Update `FRONTEND_URL` environment variable with your Vercel URL
   - Redeploy backend

---

## ✅ Step 4: Verify Deployment

1. **Test Backend**:
   - Visit: `https://propertyshare-pro-backend.onrender.com/api/health`
   - Should see: `{"success": true, "message": "PropertyShare Pro API is running"}`

2. **Test Frontend**:
   - Visit your Vercel URL
   - Try logging in with demo credentials:
     - Admin: `admin@propertyshare` / `Admin@123`
     - Employee: `john.doe` / `Employee@123`

---

## 🔧 Troubleshooting

### Backend Issues:
- **Build fails**: Check Node.js version (use 18.x or higher)
- **Database connection fails**: Verify MongoDB connection string and IP whitelist
- **CORS errors**: Ensure FRONTEND_URL is set correctly in Render

### Frontend Issues:
- **API calls fail**: Check VITE_API_URL in Vercel environment variables
- **Build fails**: Clear cache and redeploy

### Free Tier Limitations:
- **Render**: Backend sleeps after 15 min inactivity (first request takes ~30s to wake)
- **MongoDB Atlas**: 512MB storage limit
- **Vercel**: 100GB bandwidth/month

---

## 🎉 Success!

Your PropertyShare Pro is now live:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://propertyshare-pro-backend.onrender.com
- **Database**: MongoDB Atlas

Share your app with the world! 🚀
