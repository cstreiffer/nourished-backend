# Nourished Backend

## Getting Started

Running the backend server is done with a few steps that only need to be done once after you clone the repo.

    git clone https://github.com/cstreiffer/nourished-backend
    cd nourished-backend
    bash scripts/generate-jwt-keys.sh
    bash scripts/generate-ssl-certs.sh
    # don't put a password for the cert

## Running the server

The backend server needs Redis and Postgres.
