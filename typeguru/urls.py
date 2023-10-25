from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("account", views.account, name="account"),
    # apis
    path("api/leaderboard", views.leaderboard, name="leaderboard"),
    path("api/generate-words", views.generate_words, name="generate-words"),
    path("api/test-results", views.results, name="results"),
]
