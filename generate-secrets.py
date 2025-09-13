#!/usr/bin/env python3
"""
Generate secure secrets for Coursemate application
"""

import secrets
import string

def generate_secret(length=32):
    """Generate a random secret string"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def generate_hex_secret(length=32):
    """Generate a random hex secret"""
    return secrets.token_hex(length)

def main():
    print("🔐 Generating secure secrets for Coursemate...")
    print("=" * 60)
    
    print("\n📋 Copy these values to your .env file:")
    print("-" * 40)
    
    print(f"NEXTAUTH_SECRET={generate_secret(32)}")
    print(f"SECRET_KEY={generate_hex_secret(32)}")
    print(f"JWT_SECRET_KEY={generate_hex_secret(32)}")
    
    print("\n🔧 Additional configuration needed:")
    print("-" * 40)
    print("GOOGLE_CLIENT_ID=your-client-id-from-google-console")
    print("GOOGLE_CLIENT_SECRET=your-client-secret-from-google-console")
    print("APP_EMAIL=your-email@berkeley.edu")
    
    print("\n📝 Next steps:")
    print("-" * 40)
    print("1. Follow GOOGLE_SETUP.md to configure Google OAuth")
    print("2. Copy the generated secrets above to your .env file")
    print("3. Update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET")
    print("4. Set your APP_EMAIL")
    print("5. Run: ./start.sh")

if __name__ == "__main__":
    main()
