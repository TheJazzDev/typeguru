# Stage 1: Build the Node.js app
FROM node:19 AS nodejs_builder

WORKDIR /usr/src/nodejs_app

COPY package*.json .

RUN npm install

COPY . .

# Use npm run dev for development
CMD npm run dev

# Stage 2: Build the Python app
FROM python:3.9 AS python_builder

WORKDIR /usr/src/python_app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

# Stage 3: Final image
FROM python:3.9

WORKDIR /usr/src/app/python_app

# Copy built Node.js app from Stage 1
COPY --from=nodejs_builder /usr/src/nodejs_app ./nodejs_app

# Copy built Python app from Stage 2
COPY --from=python_builder /usr/src/python_app ./python_app

# Install Gunicorn
RUN pip install gunicorn

# Expose the port your application will listen on
EXPOSE 8000/tcp

# Define the command to start your application
CMD gunicorn typeguru.wsgi:application -b 0.0.0.0:8000


