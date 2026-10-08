-- CreateTable
CREATE TABLE "service-templates"
(
    "id"         TEXT         NOT NULL,
    "user_id"    TEXT         NOT NULL,
    "nickname"   TEXT         NOT NULL DEFAULT 'guest',
    "level"      INTEGER      NOT NULL DEFAULT 1,
    "rating"     INTEGER      NOT NULL DEFAULT 1000,
    "experience" INTEGER      NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service-templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service-template_achievements"
(
    "id"             TEXT         NOT NULL,
    "service-template_id"     TEXT         NOT NULL,
    "achievement_id" TEXT         NOT NULL,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service-template_achievements_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "service-templates_user_id_key" ON "service-templates" ("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "service-template_achievements_service-template_id_achievement_id_key" ON "service-template_achievements" ("service-template_id", "achievement_id");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_title_key" ON "achievements" ("title");

-- AddForeignKey
ALTER TABLE "service-template_achievements"
    ADD CONSTRAINT "service-template_achievements_service-template_id_fkey" FOREIGN KEY ("service-template_id") REFERENCES "service-templates" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service-template_achievements"
    ADD CONSTRAINT "service-template_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
