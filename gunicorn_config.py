import multiprocessing

# Bind to the specified host and port
bind = "0.0.0.0:8000"

# Number of worker processes to spawn
workers = multiprocessing.cpu_count() * 2 + 1

# Access log configuration
accesslog = "-"  # Log to STDOUT

# Define the format for access logs
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(q)s" "%(D)s"'

# Number of threads per worker process
threads = 3

# Set worker class to 'gevent' for better performance with asynchronous code
worker_class = "gevent"

# Set a timeout for worker processes (in seconds)
timeout = 90

# Set the maximum number of requests a worker will process before restarting
max_requests = 1000

# Specify the location of your Django application
chdir = "./capstone"

# Enable graceful reloading of workers on code changes
reload = True
