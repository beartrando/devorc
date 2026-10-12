-- CreateEnum
CREATE TYPE "BattleCellValue" AS ENUM ('X', 'O', 'EMPTY');

-- CreateEnum
CREATE TYPE "BattleStatus" AS ENUM ('Created', 'Matched', 'Ready', 'Started', 'Finished', 'Cancelled');

-- CreateTable
CREATE TABLE "battles"
(
    "id"           TEXT           NOT NULL,
    "player_ids"   TEXT[],
    "board"        "BattleCellValue"[],
    "status"       "BattleStatus" NOT NULL,
    "winner_id"    TEXT,
    "last_move_at" TIMESTAMP(3)            DEFAULT CURRENT_TIMESTAMP,
    "created_at"   TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3)   NOT NULL,

    CONSTRAINT "battles_pkey" PRIMARY KEY ("id")
);
