from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("signin", views.login_view, name="signin"),
    path("signout", views.logout_view, name="signout"),
    path("signup", views.register, name="signup"),
    # path("api/user-info", views.user_info, name="user-info"),
    path("account", views.account, name="account"),
    path("results", views.results, name="results"),
    path("leaderboard", views.leaderboard, name="leaderboard"),
    path("generate-words", views.generate_words, name="generate-words"),
]
