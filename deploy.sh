#!/bin/bash

# Coursemate Deployment Script
echo "🚀 Coursemate Deployment Helper"
echo "================================"

echo ""
echo "📋 Choose your deployment option:"
echo "1. Vercel + Railway (Recommended)"
echo "2. Netlify + Heroku"
echo "3. Docker (DigitalOcean)"
echo "4. Manual deployment guide"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🎯 Vercel + Railway Deployment"
        echo "=============================="
        echo ""
        echo "📱 Frontend (Vercel):"
        echo "1. Go to: https://vercel.com"
        echo "2. Sign up with GitHub"
        echo "3. Import repository: nidhimath/CourseMate"
        echo "4. Set root directory: nextjs-frontend"
        echo "5. Add environment variables:"
        echo "   - NEXTAUTH_URL: https://your-app.vercel.app"
        echo "   - NEXTAUTH_SECRET: [generate with ./generate-secrets.py]"
        echo "   - GOOGLE_CLIENT_ID: [your Google OAuth client ID]"
        echo "   - GOOGLE_CLIENT_SECRET: [your Google OAuth secret]"
        echo "   - API_BASE_URL: [will be your Railway backend URL]"
        echo ""
        echo "🔧 Backend (Railway):"
        echo "1. Go to: https://railway.app"
        echo "2. Sign up with GitHub"
        echo "3. Create new project → Deploy from GitHub repo"
        echo "4. Select: nidhimath/CourseMate"
        echo "5. Set root directory: flask-backend"
        echo "6. Add PostgreSQL database"
        echo "7. Add environment variables:"
        echo "   - DATABASE_URL: \${{Postgres.DATABASE_URL}}"
        echo "   - SECRET_KEY: [generate with ./generate-secrets.py]"
        echo "   - JWT_SECRET_KEY: [generate with ./generate-secrets.py]"
        echo "   - FLASK_ENV: production"
        echo ""
        echo "🔑 Generate secrets:"
        python3 generate-secrets.py
        ;;
    2)
        echo ""
        echo "🎯 Netlify + Heroku Deployment"
        echo "=============================="
        echo "See DEPLOYMENT_GUIDE.md for detailed instructions"
        ;;
    3)
        echo ""
        echo "🎯 Docker Deployment"
        echo "==================="
        echo "See DEPLOYMENT_GUIDE.md for detailed instructions"
        ;;
    4)
        echo ""
        echo "📖 Opening deployment guide..."
        if command -v open &> /dev/null; then
            open DEPLOYMENT_GUIDE.md
        else
            echo "Please open DEPLOYMENT_GUIDE.md in your editor"
        fi
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "✅ Next steps:"
echo "1. Follow the deployment instructions above"
echo "2. Update Google OAuth redirect URIs"
echo "3. Test your deployed application"
echo "4. Share your live URL!"
echo ""
echo "📚 For detailed instructions, see: DEPLOYMENT_GUIDE.md"
