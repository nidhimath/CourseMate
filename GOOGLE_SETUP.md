# Google Cloud Console Setup Guide for Coursemate

## 🏗️ **Step-by-Step Google Cloud Console Configuration**

### 1. **Create a New Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Fill in the details:
   - **Project Name**: `Coursemate Berkeley Study Assistant`
   - **Project ID**: `coursemate-berkeley-2024` (or similar unique ID)
   - **Organization**: Select your organization (if applicable)
   - **Location**: Choose your preferred location
5. Click "Create"

### 2. **Enable Required APIs**

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for and enable these APIs:
   - **Google+ API** (for OAuth)
   - **Google Identity** (for authentication)

### 3. **Configure OAuth Consent Screen**

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose **External** user type (unless you have a Google Workspace)
3. Click "Create"

#### **App Information**
- **App Name**: `Coursemate`
- **User Support Email**: `your-email@berkeley.edu`
- **App Logo**: Upload a logo (optional)
- **App Domain**:
  - **Application Homepage**: `http://localhost:3000`
  - **Application Privacy Policy**: `http://localhost:3000/privacy`
  - **Application Terms of Service**: `http://localhost:3000/terms`

#### **Authorized Domains**
- `localhost`
- `your-domain.com` (for production)

#### **Developer Contact Information**
- **Email Addresses**: `your-email@berkeley.edu`

4. Click "Save and Continue"

#### **Scopes** (Step 2)
- Click "Add or Remove Scopes"
- Add these scopes:
  - `../auth/userinfo.email`
  - `../auth/userinfo.profile`
  - `openid`
- Click "Update" then "Save and Continue"

#### **Test Users** (Step 3)
- Add your email address as a test user
- Click "Save and Continue"

### 4. **Create OAuth 2.0 Credentials**

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose **Web application**
4. Fill in the details:

#### **Name**
- `Coursemate Web Client`

#### **Authorized JavaScript Origins**
```
http://localhost:3000
https://your-domain.com
```

#### **Authorized Redirect URIs**
```
http://localhost:3000/api/auth/callback/google
https://your-domain.com/api/auth/callback/google
```

5. Click "Create"
6. **Copy the Client ID and Client Secret** - you'll need these for your `.env` file

### 5. **Configure Environment Variables**

1. Copy the template:
```bash
cp env.template .env
```

2. Edit `.env` with your actual values:
```bash
# Replace these with your actual values from Google Cloud Console
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret

# Generate a random secret
NEXTAUTH_SECRET=your-random-secret-here
SECRET_KEY=your-flask-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Update with your email
APP_EMAIL=your-email@berkeley.edu
```

### 6. **Generate Random Secrets**

You can generate secure random secrets using these commands:

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Generate Flask secret key
python -c "import secrets; print(secrets.token_hex(32))"

# Generate JWT secret key
python -c "import secrets; print(secrets.token_hex(32))"
```

## 🔧 **Recommended Settings Summary**

### **Project Configuration**
- **Project Name**: `Coursemate Berkeley Study Assistant`
- **Project ID**: `coursemate-berkeley-2024`
- **User Type**: External
- **App Name**: `Coursemate`
- **Support Email**: `your-email@berkeley.edu`

### **OAuth Configuration**
- **Application Type**: Web application
- **Authorized Origins**: `http://localhost:3000`
- **Redirect URIs**: `http://localhost:3000/api/auth/callback/google`
- **Scopes**: `email`, `profile`, `openid`

### **Environment Variables**
```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret
API_BASE_URL=http://localhost:5000
APP_EMAIL=your-email@berkeley.edu
```

## 🚨 **Important Notes**

1. **Test Users**: Make sure to add your email as a test user in the OAuth consent screen
2. **Redirect URIs**: The redirect URI must match exactly: `http://localhost:3000/api/auth/callback/google`
3. **Secrets**: Keep your client secret secure and never commit it to version control
4. **Development vs Production**: You'll need separate OAuth credentials for production

## 🧪 **Testing Your Configuration**

After setting up, you can test your configuration:

1. Start the application: `./start.sh`
2. Go to `http://localhost:3000`
3. Click "Sign in with Google"
4. You should be redirected to Google's OAuth consent screen
5. After authorization, you should be redirected back to the application

## 🆘 **Troubleshooting**

### Common Issues:
1. **"redirect_uri_mismatch"**: Check that your redirect URI matches exactly
2. **"access_denied"**: Make sure you're added as a test user
3. **"invalid_client"**: Verify your client ID and secret are correct
4. **CORS errors**: Ensure your origins are properly configured

### Debug Steps:
1. Check the browser console for errors
2. Verify environment variables are loaded correctly
3. Check Google Cloud Console logs
4. Ensure all APIs are enabled
