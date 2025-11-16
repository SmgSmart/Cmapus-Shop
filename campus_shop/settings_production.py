from .settings import *
import os

# Production settings
DEBUG = False

# Allowed hosts for production
ALLOWED_HOSTS = [
    '.vercel.app',
    'localhost',
    '127.0.0.1',
    '.ngrok.io',
    '.herokuapp.com',
    # Add your custom domain here if you have one
]

# CORS settings for production
CORS_ALLOWED_ORIGINS = [
    "https://*.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
]

CORS_ALLOW_ALL_ORIGINS = True  # For development - set to False in production with specific origins

# Database - Use PostgreSQL for production (Vercel doesn't support SQLite well)
# For now, we'll keep SQLite but you should move to PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Static files settings for production
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files settings
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Security settings for production
SECURE_SSL_REDIRECT = False  # Set to True when using HTTPS
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Session settings
SESSION_COOKIE_SECURE = False  # Set to True when using HTTPS
CSRF_COOKIE_SECURE = False     # Set to True when using HTTPS

# Email settings (configure your email backend)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    },
}