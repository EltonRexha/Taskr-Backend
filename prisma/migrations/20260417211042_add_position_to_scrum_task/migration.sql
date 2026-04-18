/*
  Warnings:

  - You are about to drop the column `active` on the `sprints` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "scrum_tasks" ADD COLUMN     "position" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "sprints" DROP COLUMN "active";
