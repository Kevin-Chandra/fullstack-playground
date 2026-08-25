# Migrations

The schema is whatever the files in this directory say it is. `synchronize` is
off in every environment — it used to be on outside production, which meant the
schema was a side effect of whatever the entity files happened to say at boot,
and production had no path to a schema change at all.

## Changing the schema

Edit the entity, then let TypeORM diff it against a database that is already up
to date:

```bash
npm run migration:generate -- src/migrations/AddSomething
npm run migration:show          # [X] applied, [ ] pending
```

Generation compares entities against the **connected** database, so run it
against one with every earlier migration applied — otherwise the diff comes out
as the whole schema again. Read the result before committing it: a generated
rename is a DROP plus an ADD, which is a generated way to lose a column.

Migrations are applied at boot when `DATABASE_MIGRATIONS_RUN` is true (the
default). To apply them by hand, or as a deploy step ahead of the rollout:

```bash
npm run migration:run
npm run migration:revert        # steps back exactly one
```

Both commands read the same `.development.env` and the same connection settings
the app uses, through `src/config/data-source.ts`.

## Indexes TypeORM cannot infer

Declare them on the entity rather than in raw SQL — `@Index(name, [cols], { type: "gin" })`
is understood by both the generator and the schema reader, so it round-trips.
An index created outside entity metadata is *extraneous* to TypeORM, and the
next generated migration will quietly try to drop it.

## Baselining a database that predates this directory

A database whose schema was built by `synchronize` already has the tables the
initial migration creates, so running it would fail on the first `CREATE TABLE`.
Record it as applied instead, after confirming there is nothing to apply:

```bash
# Must print "No changes in database schema were found".
npm run typeorm -- migration:generate src/migrations/Check --ch
```

If it prints anything else, that output *is* the delta between the old database
and the initial migration — apply it by hand first. Then, against that database:

```sql
BEGIN;
INSERT INTO "migrations" ("timestamp", "name")
SELECT <timestamp>, '<ClassName>'
 WHERE NOT EXISTS (SELECT 1 FROM "migrations" WHERE "name" = '<ClassName>');
COMMIT;
```

`<ClassName>` and `<timestamp>` are the class name and the leading digits of the
migration filename. Fresh databases need none of this — they just run.
