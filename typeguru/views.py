from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

from .models import TypingData, User


# Create your views here.
def index(request):
    return render(request, "typeguru/index.html")


def user_info(request):
    user = User.objects.get(pk=request.user.id)
    return JsonResponse({"id": user.id, "username": user.username, "email": user.email, "data_registered": user.date_registered})


def account(request, user):
    pass


def results(request):
    pass
