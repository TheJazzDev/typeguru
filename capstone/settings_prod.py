# production.py
import os

DEBUG = True

ALLOWED_HOSTS = [
    "cloud.appwrite.io",
    "typeguru2-1dhasm5l.b4a.run",
    "node41a.containers.back4app.com",
    "127.0.0.1",
    ".vercel.app",
    ".now.sh",
    "localhost",
]

SECURE_HSTS_SECONDS = 3600
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
