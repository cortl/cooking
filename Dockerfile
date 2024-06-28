# Use the official PostgreSQL image from Docker Hub
FROM postgres:14

# Copy the SQL script to a folder in Docker container
COPY sql/* /docker-entrypoint-initdb.d/

# Expose the default PostgreSQL port
EXPOSE 5432