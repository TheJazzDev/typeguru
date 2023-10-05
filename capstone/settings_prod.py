# production.py
import os

DEBUG = False

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


ALLOWED_HOSTS = [
    "cloud.appwrite.io",
    "typeguru2-1dhasm5l.b4a.run",
    "node36a.containers.back4app.com",
    "127.0.0.1",
]


# SSL Certificate and Key Paths
SSL_CERTIFICATE = os.path.join(BASE_DIR, "./ngix/localhost.crt")
SSL_KEY = os.path.join(BASE_DIR, "./ngix/localhost.key")


SECURE_HSTS_SECONDS = 3600
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")


# Simplified static file serving.
# https://pypi.org/project/whitenoise/
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
