from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("api/user-info", views.user_info, name="user-info"),
    path("account<str:user>", views.account, name="account"),
    path("results", views.results, name="results"),
]
