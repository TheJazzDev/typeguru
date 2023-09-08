FROM python:3.9
ENV PYTHONUNBUFFERED 1

# set working directory
WORKDIR /usr/src/app

# Copy and install Python dependencies
COPY requirements.txt /usr/src/app/
RUN pip install -r requirements.txt

# Copy Node.js-related files
COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/

# Install Node.js dependencies
RUN apt update && apt install -y nodejs npm
RUN npm install

# Copy the rest of your application
COPY . /usr/src/app/
