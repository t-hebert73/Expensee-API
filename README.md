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

## Project Setup

```sh
npm install
```

### Generates the [prisma db client](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/generating-prisma-client) & related types

```sh
npm run build
```
### If this is your first run of the project:

```sh
npx prisma migrate dev
```
This will run the migrations on your DB.

&nbsp;

### Start the dev server
```sh
npm run dev
```

You should be up and running at [localhost:4000](http://localhost:4000)

&nbsp;

### Run the tests

```sh
npm run test
```


