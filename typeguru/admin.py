from django.contrib import admin

from .models import TypingData, User

# Register your models here.


class AdminUser(admin.ModelAdmin):
    list_display = ("username", "email", "date_joined")


class AdminTypingData(admin.ModelAdmin):
    list_display = ("id", "user", "wpm", "accuracy", "mode", "difficulty", "timestamp")


admin.site.register(User, AdminUser)
admin.site.register(TypingData, AdminTypingData)
