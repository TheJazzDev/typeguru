from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("signout", views.logout_view, name="signout"),
    path("signup", views.register, name="signup"),
    path("account", views.account, name="account"),
    path("api/leaderboard", views.leaderboard, name="leaderboard"),
    path("api/generate-words", views.generate_words, name="generate-words"),
    path("results", views.results, name="results"),
]
