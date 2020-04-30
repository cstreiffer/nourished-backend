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

### Database migrations and seeding 
For the database to be setup and ready for use the migration process needs to be executed. This will setup the schema and all the updates required.
To successfully run the migration you must have the `sequlize` npm module installed and ensure that the `./node_modules/.bin/sequelize` exist.
If CLI utilty is missing simply re-run the installation using: 

    npm install sequelize-cli

To *migrate* the database to the latest schema, use the following. The changes in the [`./migrations/`](./migrations) folder will be applied.

    PGPASSWORD=<db password> npm run migrate

*** NOTE *** The password is specified in plain text. In production this should be masked (espectically if CI/CD pipelines are executing the deployment)

To generate a new migration file run the following command:
    NODE_ENV=development npx sequelize migration:generate --name <name of db model, e.g Menus>


# One time load of sample data
For local development the following command will load the database with example data for local development
As a one time step, load the data.

    docker-compose run backend node test_load.js



## Running the server

Running the server should be a simple:

    docker-compose up

In your browser, go to http://localhost:3000/api/restaurants

Alternatively, you can run the server with DEBUG turned by placing `DEBUG=express:*` in the `.env` file.


## Using swagger to test the running backend server

You can load the swagger testing framework by running the backend server, and then going to http://localhost:3000/api/v1/docs/

## Testing with stripe webhooks

First install the stripe command line tool

    brew install stripe/stripe-cli/stripe

Then login to your stripe account

    stripe login

Forward events

    stripe listen --forward-to localhost:3000/api/stripe/webhook

Trigger an event

    stripe trigger payment_intent.created


More information can be read here https://stripe.com/docs/webhooks/test



# Tools

## Sequelize

Sequelize is used as an ORM to the database.  See https://sequelize.org/master/manual/

### Optional tools: 
 - [Nvm](https://github.com/creationix/nvm)
 - [npx](https://github.com/npm/npx)
 - [jq](https://stedolan.github.io/jq/)
 - curl