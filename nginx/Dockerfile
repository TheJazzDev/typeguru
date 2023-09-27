# Use an official Nginx runtime as a parent image
FROM nginx:latest

# Copy your custom Nginx configuration file to the container
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 for incoming HTTP traffic
EXPOSE 80

# Define the command to start Nginx
CMD ["nginx", "-g", "daemon off;"]
