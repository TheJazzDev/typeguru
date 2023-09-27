# Set the base image
FROM python:3.9

# Set the working directory
WORKDIR /usr/src/app

# Copy your application files and requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install -r requirements.txt

# Copy the entire Django project into the container
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose the port your application will listen on (Gunicorn default is 8000)
EXPOSE 8000/tcp

# Create and set an entrypoint script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
