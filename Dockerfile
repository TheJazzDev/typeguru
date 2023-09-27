# Set the base image
FROM python:3.9

# Set the working directory
WORKDIR /usr/src/app

# Copy your application files and requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install -r requirements.txt

# Copy static files if needed
COPY static /path/to/static/directory

COPY . .

# Expose the port your application will listen on
EXPOSE 8000/tcp

# Command to start the server
CMD [ "gunicorn", "typeguru.wsgi", "--bind", "0.0.0.0:8000" ]
# CMD python manage.py runserver 0.0.0.0:8000
