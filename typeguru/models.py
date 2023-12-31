from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    date_registered = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.id}: {self.username}"

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "date_registered": self.date_registered.strftime("%B %d, %Y"),
        }


class TypingData(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    wpm = models.IntegerField()
    accuracy = models.FloatField()
    duration = models.IntegerField()
    difficulty = models.CharField(max_length=12)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.id}: {self.user} {self.wpm} {self.accuracy} {self.difficulty}"

    def serialize(self):
        return {
            "user": {
                "username": self.user.username,
                "email": self.user.email,
            },
            "wpm": self.wpm,
            "accuracy": self.accuracy,
            "duration": self.duration,
            "difficulty": self.difficulty,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
        }
