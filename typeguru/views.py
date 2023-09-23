import json
import os
import random

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.db.models import Count, Max
from django.http import (
    HttpResponseNotFound,
    HttpResponseRedirect,
    HttpResponseServerError,
    JsonResponse,
)
from django.shortcuts import render
from django.urls import reverse

from .models import TypingData, User


# Create your views here.
def index(request):
    try:
        user = User.objects.get(pk=request.user.id)
    except Exception as e:
        print("Unable to get user info:", e)
    return render(request, "typeguru/index.html", {"user": user})


def login_view(request):
    if request.method == "POST":
        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(
                request,
                "typeguru/signin.html",
                {"message": "Invalid username and/or password."},
            )
    else:
        return render(request, "typeguru/signin.html")


def logout_view(request):
    # Handle User logout
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(
                request, "typeguru/register.html", {"message": "Passwords must match."}
            )

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(
                request,
                "typeguru/register.html",
                {"message": "Username already taken."},
            )
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "typeguru/register.html")


@login_required
def account(request):
    try:
        user = User.objects.get(pk=request.user.id)
        all_data = TypingData.objects.filter(user=user)
        all_data = all_data.order_by("-timestamp").all()
    except Exception as e:
        print("Unable to get user typing data:", e)

    return render(
        request,
        "typeguru/account.html",
        {"user": user, "all_data": all_data},
    )


@login_required
def results(request):
    # Ensure the method is only POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required!"}, status=400)

    # Parse the JSON data from the request body
    data = json.loads(request.body)
    wpm = data.get("wpm", "")
    accuracy = data.get("accuracy", "")
    mode = data.get("mode", "")
    difficulty = data.get("difficulty", "")

    try:
        TypingData.objects.create(
            user=request.user,
            wpm=wpm,
            accuracy=accuracy,
            mode=mode,
            difficulty=difficulty,
        )
        print("Saved")
        return JsonResponse({"message": "Result updated successfuly!"}, status=201)
    except Exception as e:
        print("Failed to update result:", e)
        return JsonResponse({"error": "Failed to update result:"}, status=400)


@login_required
def leaderboard(request):
    # Ensure the method is only GET
    if request.method != "GET":
        return JsonResponse({"error": "GET request required!"}, status=400)

    try:
        leaderboard = (
            TypingData.objects.values("user__id", "user__username")
            .annotate(
                wpm=Max("wpm"),
                accuracy=Max("accuracy"),
                mode=Max("mode"),
                difficulty=Max("difficulty"),
                timestamp=Max("timestamp"),
            )
            .order_by("-wpm")
            .distinct()
        )

        serialized_leaderboard = list(leaderboard)

        return JsonResponse({"data": serialized_leaderboard})
    except Exception as e:
        print("Unable to get leaderboard:", e)
        return JsonResponse({"error": "Unable to get leaderboard:"}, status=400)


def generate_words(request):
    # Ensure the method is only POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required!"}, status=400)

    # Parse the JSON data from the request body
    data = json.loads(request.body)
    mode = data.get("mode", "")

    if mode is None:
        return JsonResponse({"error": "Mode is required"}, status=400)

    try:
        module_dir = os.path.dirname(__file__)
        file_path = os.path.join(module_dir, f"static/dictionary/{mode}.txt")
        with open(file_path, "r") as file:
            # Read the list of lists from the file
            word_lists = json.load(file)

            # Select a random list index
            list_index = random.randint(0, len(word_lists) - 1)

            # Select a random word from the chosen list
            selected_word = word_lists[list_index]

            return JsonResponse({"words": selected_word}, safe=False)
    except FileNotFoundError:
        return JsonResponse({"error": "File not found"}, status=404)
    except Exception as e:
        print("Unable to generate words:", e)
        return JsonResponse({"error": str(e)}, status=500)