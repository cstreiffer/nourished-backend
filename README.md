# Nourished Backend

## Getting Started

Assuming you are using a macbook or OSX for development.  You need to:

1. Install https://hub.docker.com/editions/community/docker-ce-desktop-mac
2. Are comfortable running things from the command line using (Command-Space terminal)
3. Have docker-compose.  If you are on a Mac or Windows, you have it as part of the desktop install from 1.

Running the backend server is done with a few steps that only need to be done once after you clone the repo.

    git clone https://github.com/cstreiffer/nourished-backend
    cd nourished-backend
    bash scripts/generate-jwt-keys.sh
    bash scripts/generate-ssl-certs.sh
    # don't put a password for the cert

### Connecting to the database

A backend postgres database is needed to run the backend.  The following steps will create the database, putting the data files in your `pgdata` folder so it is stored when the postgres docker container is not running.  These steps only need to be done once.

    docker-compose up db

Once you see the following:

    db_1       | 2020-04-09 23:38:40.915 UTC [1] LOG:  database system is ready to accept connections

then open another window to the same folder the `docker-compose.yml` file is in, leave the one with the db running, and type:

     bash scripts/psql.sh

it should connect and show you the database prompt.


Connect to the nourished_dev datbase:

     \c nourished_dev

List the tables:

     \d

                 List of relations
      Schema |    Name     | Type  |  Owner
      --------+-------------+-------+----------
       public | hospitals   | table | postgres
       public | meals       | table | postgres
       public | menus       | table | postgres
       public | orders      | table | postgres
       public | restaurants | table | postgres
       public | users       | table | postgres
      (6 rows)


## Running the server

Running the server should be a simple:

    docker-compose up

In your browser, go to http://localhost:3000/api/restaurants
