# Stage 1: Build the Python app
FROM python:3.9 AS python_builder

WORKDIR /usr/src/python_app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

# Stage 2: Final image
FROM python:3.9

WORKDIR /usr/src/app/python_app

# Copy built Python app from Stage 1
COPY --from=python_builder /usr/src/python_app ./python_app

# Install Gunicorn
RUN pip install gunicorn

# Expose the port your application will listen on
EXPOSE 8000/tcp

# Define the command to start your application with Gunicorn
CMD gunicorn typeguru.wsgi:application -b 0.0.0.0:8000
