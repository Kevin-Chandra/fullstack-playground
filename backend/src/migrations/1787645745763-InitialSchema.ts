import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1787645745763 implements MigrationInterface {
  name = "InitialSchema1787645745763";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."media_mediatype_enum" AS ENUM('image', 'audio', 'video')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."media_uploadpath_enum" AS ENUM('home')`,
    );
    await queryRunner.query(
      `CREATE TABLE "media" ("id" BIGSERIAL NOT NULL, "key" character varying NOT NULL, "mediaType" "public"."media_mediatype_enum" NOT NULL, "uploadPath" "public"."media_uploadpath_enum" NOT NULL, "deletedFromStorageAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_b305063b0a030ab458c128078c7" UNIQUE ("key"), CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7f4f6178088e93400eaada71c6" ON "media"  ("deletedFromStorageAt", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "rsvp" ("id" BIGSERIAL NOT NULL, "pax" integer NOT NULL, "attending" boolean NOT NULL, "notes" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "guestId" bigint NOT NULL, CONSTRAINT "REL_57917d22444709918499e2f583" UNIQUE ("guestId"), CONSTRAINT "PK_33487519e664b4559d391ab71fb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "wishes" ("id" BIGSERIAL NOT NULL, "message" character varying NOT NULL, "imageKey" text, "audioKey" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "guestId" bigint, CONSTRAINT "PK_9c08d144e42ca0aa37a024597ad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."guests_invitationtype_enum" AS ENUM('online', 'offline')`,
    );
    await queryRunner.query(
      `CREATE TABLE "guests" ("id" BIGSERIAL NOT NULL, "name" text NOT NULL, "uuid" text NOT NULL, "pax" integer NOT NULL, "phoneNumber" text, "email" text, "notes" text, "invitationType" "public"."guests_invitationtype_enum" NOT NULL DEFAULT 'online', CONSTRAINT "UQ_9088165c47665ec04d83579089a" UNIQUE ("uuid"), CONSTRAINT "PK_4948267e93869ddcc6b340a2c46" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pages" ("id" BIGSERIAL NOT NULL, "slug" text NOT NULL, "name" text NOT NULL, "draftVersion" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe66ca6a86dc94233e5d7789535" UNIQUE ("slug"), CONSTRAINT "PK_8f21ed625aa34c8391d636b7d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_userstatus_enum" AS ENUM('active', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" BIGSERIAL NOT NULL, "username" text NOT NULL, "passwordHash" text NOT NULL, "name" text NOT NULL, "userStatus" "public"."users_userstatus_enum" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "page_publications" ("id" BIGSERIAL NOT NULL, "pageId" bigint NOT NULL, "version" integer NOT NULL, "description" text NOT NULL, "sections" jsonb NOT NULL, "publishedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "publishedById" bigint, CONSTRAINT "PK_1e04fe7ddc9d7c0b3c33912e9c6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "page_publications_sections_gin" ON "page_publications" USING gin ("sections") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_30810a61938305a0e849b4ffcb" ON "page_publications"  ("pageId", "version") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3a687e21b7d9b094097415f1c3" ON "page_publications"  ("pageId", "id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."page_sections_type_enum" AS ENUM('hero', 'countdown', 'couple', 'reception', 'gallery')`,
    );
    await queryRunner.query(
      `CREATE TABLE "page_sections" ("id" BIGSERIAL NOT NULL, "uuid" character varying NOT NULL, "pageId" bigint NOT NULL, "type" "public"."page_sections_type_enum" NOT NULL, "sortOrder" integer NOT NULL, "isVisible" boolean NOT NULL DEFAULT true, "data" jsonb NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_b8d820d2f4c5ca8cde8e056c749" UNIQUE ("uuid"), CONSTRAINT "PK_febb265da4ebfa7cf6bb0e732b4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "page_sections_data_gin" ON "page_sections" USING gin ("data") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_59cfcc1206d9054be34845fe38" ON "page_sections"  ("pageId", "uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "rsvp" ADD CONSTRAINT "FK_57917d22444709918499e2f583f" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishes" ADD CONSTRAINT "FK_271f7466ea8e39fef2e10f1129b" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "page_publications" ADD CONSTRAINT "FK_4b59377fc967e91df9c9a02bd3b" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "page_publications" ADD CONSTRAINT "FK_1f7b4860eb089a43e09d8f3987c" FOREIGN KEY ("publishedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "page_sections" ADD CONSTRAINT "FK_126a8ff037a529b8c63a2da2ee3" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "page_sections" DROP CONSTRAINT "FK_126a8ff037a529b8c63a2da2ee3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "page_publications" DROP CONSTRAINT "FK_1f7b4860eb089a43e09d8f3987c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "page_publications" DROP CONSTRAINT "FK_4b59377fc967e91df9c9a02bd3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishes" DROP CONSTRAINT "FK_271f7466ea8e39fef2e10f1129b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rsvp" DROP CONSTRAINT "FK_57917d22444709918499e2f583f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_59cfcc1206d9054be34845fe38"`,
    );
    await queryRunner.query(`DROP INDEX "public"."page_sections_data_gin"`);
    await queryRunner.query(`DROP TABLE "page_sections"`);
    await queryRunner.query(`DROP TYPE "public"."page_sections_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3a687e21b7d9b094097415f1c3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_30810a61938305a0e849b4ffcb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."page_publications_sections_gin"`,
    );
    await queryRunner.query(`DROP TABLE "page_publications"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_userstatus_enum"`);
    await queryRunner.query(`DROP TABLE "pages"`);
    await queryRunner.query(`DROP TABLE "guests"`);
    await queryRunner.query(`DROP TYPE "public"."guests_invitationtype_enum"`);
    await queryRunner.query(`DROP TABLE "wishes"`);
    await queryRunner.query(`DROP TABLE "rsvp"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7f4f6178088e93400eaada71c6"`,
    );
    await queryRunner.query(`DROP TABLE "media"`);
    await queryRunner.query(`DROP TYPE "public"."media_uploadpath_enum"`);
    await queryRunner.query(`DROP TYPE "public"."media_mediatype_enum"`);
  }
}
