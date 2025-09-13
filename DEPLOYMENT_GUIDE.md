# 🚀 Coursemate Deployment Guide

## 🌐 Deployment Options

### **Option 1: Vercel + Railway (Recommended)**

#### **Frontend (Next.js) → Vercel**
1. **Go to**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **Import your repository**: `nidhimath/CourseMate`
4. **Set root directory**: `nextjs-frontend`
5. **Add environment variables**:
   ```
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-secret-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   API_BASE_URL=https://your-backend.railway.app
   ```
6. **Deploy!**

#### **Backend (Flask) + Database → Railway**
1. **Go to**: https://railway.app
2. **Sign up/Login** with GitHub
3. **Create new project** → "Deploy from GitHub repo"
4. **Select your repository**: `nidhimath/CourseMate`
5. **Set root directory**: `flask-backend`
6. **Add PostgreSQL database**:
   - Click "New" → "Database" → "PostgreSQL"
7. **Add environment variables**:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   SECRET_KEY=your-secret-key
   JWT_SECRET_KEY=your-jwt-secret
   FLASK_ENV=production
   ```
8. **Deploy!**

---

### **Option 2: Netlify + Heroku**

#### **Frontend → Netlify**
1. **Go to**: https://netlify.com
2. **Connect GitHub** and select your repo
3. **Build settings**:
   - Build command: `cd nextjs-frontend && npm run build`
   - Publish directory: `nextjs-frontend/out`
4. **Add environment variables** (same as Vercel)
5. **Deploy!**

#### **Backend → Heroku**
1. **Go to**: https://heroku.com
2. **Create new app**
3. **Connect GitHub** repository
4. **Add PostgreSQL addon**
5. **Set environment variables**
6. **Deploy!**

---

### **Option 3: Full Docker Deployment**

#### **DigitalOcean App Platform**
1. **Go to**: https://cloud.digitalocean.com/apps
2. **Create app** from GitHub
3. **Select your repository**
4. **Configure services**:
   - Frontend service (Next.js)
   - Backend service (Flask)
   - Database service (PostgreSQL)
5. **Deploy!**

---

## 🔧 Pre-Deployment Setup

### **1. Update Google OAuth Settings**
Add these redirect URIs to your Google Cloud Console:
```
https://your-app.vercel.app/api/auth/callback/google
https://your-app.netlify.app/api/auth/callback/google
```

### **2. Environment Variables for Production**

#### **Frontend (.env.production)**
```bash
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
API_BASE_URL=https://your-backend-url.com
```

#### **Backend (.env.production)**
```bash
DATABASE_URL=postgresql://user:pass@host:port/db
SECRET_KEY=your-super-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
FLASK_ENV=production
```

### **3. Database Migration**
The database will be automatically seeded on first deployment.

---

## 🎯 **Recommended: Vercel + Railway**

**Why this combination?**
- ✅ **Free tiers** for both services
- ✅ **Automatic deployments** from GitHub
- ✅ **Easy environment variable management**
- ✅ **Built-in PostgreSQL** on Railway
- ✅ **Custom domains** supported
- ✅ **SSL certificates** included

**Estimated cost**: $0/month (free tiers)

---

## 🚀 **Quick Start Deployment**

### **Step 1: Deploy Backend (Railway)**
1. Go to https://railway.app
2. Connect GitHub → Select CourseMate repo
3. Set root directory: `flask-backend`
4. Add PostgreSQL database
5. Set environment variables
6. Deploy

### **Step 2: Deploy Frontend (Vercel)**
1. Go to https://vercel.com
2. Import GitHub repo → CourseMate
3. Set root directory: `nextjs-frontend`
4. Set environment variables (use Railway backend URL)
5. Deploy

### **Step 3: Update Google OAuth**
1. Go to Google Cloud Console
2. Add production redirect URIs
3. Test authentication

**Your app will be live in ~10 minutes!**

---

## 🔍 **Post-Deployment Checklist**

- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] Google OAuth works
- [ ] Database connection established
- [ ] All pages accessible
- [ ] Knowledge graph interactive
- [ ] Lessons load properly

---

## 🆘 **Troubleshooting**

### **Common Issues:**
1. **CORS errors**: Check API_BASE_URL in frontend
2. **OAuth redirect errors**: Verify redirect URIs in Google Console
3. **Database connection**: Check DATABASE_URL format
4. **Build failures**: Check environment variables

### **Support:**
- Vercel docs: https://vercel.com/docs
- Railway docs: https://docs.railway.app
- NextAuth docs: https://next-auth.js.org
