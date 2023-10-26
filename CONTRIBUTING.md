# Contributing Guidelines

## Table of Contents

- [Fork the Repository](#fork-the-repository)
- [Clone the Forked Repository](#clone-the-forked-repository)
- [Create a .env File](#create-a-env-file)
- [Edit the .env File](#edit-the-env-file)
- [Generate a Secret Key](#generate-a-secret-key)
- [Save and Close the .env File](#save-and-close-the-env-file)
- [Build Docker Containers](#build-docker-containers)
- [Start the Development Server](#start-the-development-server)
- [Run Database Migrations](#run-database-migrations)
- [Create a Django Superuser](#create-a-django-superuser)
- [Create a Branch](#create-a-branch)
- [Make Necessary Changes and Commit](#make-necessary-changes-and-commit)
- [Push Changes to GitHub](#push-changes-to-github)
- [Open a Pull Request](#open-a-pull-request)

Thank you for your interest in contributing to our project! To get started, please follow the instructions below to set up your environment and contribute effectively.

## Fork the Repository

Fork the repository by clicking the "Fork" button at the top right of the repo page. This will create a copy of the repository under your GitHub account.

## Clone the Forked Repository

Next, clone your forked repository locally by running:

```bash
git clone https://github.com/your-username/typeguru.git
```

## Create a `.env` File

Navigate to the project's root directory and create a new .env file:

```bash
cd typeguru
touch .env
```

## Edit the `.env` File

Open the .env file in a text editor of your choice and add the necessary environment variables:

```ini
DJANGO_ENVIRONMENT="dev"
SECRET_KEY="your_secret_key"
DB_ENGINE=django.db.backends.postgresql
DB_NAME=db_name
DB_USER=db_user
DB_PASSWORD=db_password
DB_HOST=db
DB_PORT=5432
```

Do not change `DJANGO_ENVIRONMENT`.

If you are using Postgres, the provided configuration should work. Be sure to replace `your_secret_key`, `db_name`, `db_user` and `db_password` with your actual database credentials. `DB_HOST` should be left unchanged if you are using Docker Compose.

## Generate a Secret Key

You can generate a secret key by running the following command:

```python
python3 manage.py shell -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copy the generated key and replace "your_secret_key" in the .env file with it.

## Save and Close the `.env` File

Save your changes and close the .env file.

## Build Docker Containers

Open a new terminal and run the following command to build Docker containers:

```bash
docker-compose build
```

This command will build the necessary containers for your project.

## Start the Development Server

zzun the following command to start the development server:

```bash
docker-compose up
```

This will start the development server, and you can access it at http://localhost:8000 in your web browser.

## Run Database Migrations

To apply database migrations, run the following command in a new terminal.

```bash
docker exec -it django bash -l
```

Inside the container, run the following commands to apply migrations:

```bash
python3 manage.py makemigrations
python3 manage.py migrate
```

This will update the database schema.

## Create a Django Superuser

To create an admin user for the Django admin interface, run:

```bash
python3 manage.py createsuperuser
```

Now that your environment is set up, Docker containers are built, the development server is running, and database migrations are applied, you are ready to contribute to the project.

Please follow steps below for detailed instructions on how to submit your contributions.

## Create a Branch

Create a new branch for your changes:

```bash
git checkout -b feature-branch-name
```

This will create a new branch named "feature-branch-name" based off the master branch. Name the branch according to the feature or bugfix you are working on.

## Make Necessary Changes and Commit

Make and test your changes. Once you are done, commit your changes by running:

```bash
git add .
git commit -m "Commit message"
```

This will commit your changes locally with the commit message.

## Push Changes to GitHub

Push your committed changes to your forked repository on GitHub:

```bash
git push origin feature-branch-name
```

This will push the changes to the feature-branch-name branch of your forked repository.

## Open a Pull Request

Go to your repository on GitHub and open a new pull request from your feature branch into the master branch of the original repository. Provide a brief description of your changes and request a review.

Once your pull request is approved and merged, your changes will be live on the main repository.

Congratulations on your first contribution!

Thank you for reading this contributor guideline and for your interest in contributing. Let me know if you have any other questions!
