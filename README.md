# Expensee API

This is the GraphQL API for the Expensee app.

&nbsp;

The project uses the following:
- Typescript
- [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server)
- [Prisma ORM](https://www.prisma.io/)
- [Pothos Schema Builder](https://pothos-graphql.dev/) (with [prisma plugin](https://pothos-graphql.dev/docs/plugins/prisma))
- Postgres
- [Jest](https://jestjs.io/)

&nbsp;

## First steps

Copy the .example.env file with the name .env and fill out the variables

&nbsp;

## Running the project

```sh
docker compose up
```

This will start up the containers & do the following:
- install the dependencies
- generate the [prisma db client](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/generating-prisma-client) & related types
- migrate the database

&nbsp;

If you want you can seed the database with some data via:

```sh
docker exec -it expensee-api npm run seed
```

You should be up and running at [localhost:4000](http://localhost:4000)

&nbsp;

### Run the tests

```sh
docker exec -it expensee-api npm run test
```



