# Use an official Nginx runtime as a parent image
FROM nginx:latest

# Copy your custom Nginx configuration file to the container
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the SSL certificate and key files to the container
COPY localhost.crt /etc/nginx/localhost.crt
COPY localhost.key /etc/nginx/localhost.key

# Expose port 80 for incoming HTTP traffic
EXPOSE 80

# Define the command to start Nginx
CMD ["nginx", "-g", "daemon off;"]
