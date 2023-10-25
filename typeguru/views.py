import json
import os
import random

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.db.models import Max
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

from .models import TypingData, User


# Create your views here.
def index(request):
    return render(
        request,
        "typeguru/index.html",
    )


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
                "typeguru/login.html",
                {"message": "Invalid username and/or password."},
            )
    else:
        return render(request, "typeguru/login.html")


def logout_view(request):
    # Handle User logout
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        email = request.POST["email"]
        username = request.POST["username"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirm_password = request.POST["confirm_password"]
        if password != confirm_password:
            return render(
                request, "typeguru/signup.html", {"message": "Passwords must match."}
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
        all_data = TypingData.objects.filter(user=user).order_by("-timestamp")

        paginator = Paginator(all_data, len(all_data))  # Create a paginator with all records
        page = request.GET.get("page")  # Get the 'page' parameter from the request

        all_data = paginator.get_page(page)  # Retrieve all data for the specified page

    except Exception as e:
        print("Unable to get user typing data:", e)

    return render(
        request,
        "typeguru/account.html",
        {"user": user, "all_data": all_data},
    )



@login_required
def save_test_result(request):
    # Ensure the method is only POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required!"}, status=400)

    # Parse the JSON data from the request body
    data = json.loads(request.body)
    wpm = data.get("wpm", "")
    accuracy = data.get("accuracy", "")
    duration = data.get("duration", "")
    difficulty = data.get("difficulty", "")

    try:
        TypingData.objects.create(
            user=request.user,
            wpm=wpm,
            accuracy=accuracy,
            duration=duration,
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
                duration=Max("duration"),
                difficulty=Max("difficulty"),
                timestamp=Max("timestamp"),
            )
            .order_by("-wpm")
            .distinct()
        )

        # Format the timestamp field
        for entry in leaderboard:
            entry["timestamp"] = entry["timestamp"].strftime("%b. %d, %Y, %I:%M %p")


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
