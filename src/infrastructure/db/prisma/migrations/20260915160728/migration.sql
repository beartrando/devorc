-- CreateTable
CREATE TABLE "base-services"
(
    "id"         TEXT         NOT NULL,
    "user_id"    TEXT         NOT NULL,
    "nickname"   TEXT         NOT NULL DEFAULT 'guest',
    "level"      INTEGER      NOT NULL DEFAULT 1,
    "rating"     INTEGER      NOT NULL DEFAULT 1000,
    "experience" INTEGER      NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "base-services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base-service_achievements"
(
    "id"             TEXT         NOT NULL,
    "base-service_id"     TEXT         NOT NULL,
    "achievement_id" TEXT         NOT NULL,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "base-service_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements"
(
    "id"          TEXT         NOT NULL,
    "title"       TEXT         NOT NULL,
    "description" TEXT,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience_levels"
(
    "level"         INTEGER      NOT NULL,
    "next_required" INTEGER      NOT NULL,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experience_levels_pkey" PRIMARY KEY ("level")
);

-- CreateIndex
CREATE UNIQUE INDEX "base-services_user_id_key" ON "base-services" ("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "base-service_achievements_base-service_id_achievement_id_key" ON "base-service_achievements" ("base-service_id", "achievement_id");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_title_key" ON "achievements" ("title");

-- AddForeignKey
ALTER TABLE "base-service_achievements"
    ADD CONSTRAINT "base-service_achievements_base-service_id_fkey" FOREIGN KEY ("base-service_id") REFERENCES "base-services" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base-service_achievements"
    ADD CONSTRAINT "base-service_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
