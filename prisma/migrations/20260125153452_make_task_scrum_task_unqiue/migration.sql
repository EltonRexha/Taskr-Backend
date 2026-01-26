/*
  Warnings:

  - A unique constraint covering the columns `[task_id]` on the table `scrum_tasks` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "scrum_tasks" DROP CONSTRAINT "scrum_tasks_epic_id_fkey";

-- DropForeignKey
ALTER TABLE "scrum_tasks" DROP CONSTRAINT "scrum_tasks_task_id_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "scrum_tasks_task_id_key" ON "scrum_tasks"("task_id");

-- AddForeignKey
ALTER TABLE "scrum_tasks" ADD CONSTRAINT "scrum_tasks_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scrum_tasks" ADD CONSTRAINT "scrum_tasks_epic_id_fkey" FOREIGN KEY ("epic_id") REFERENCES "scrum_epics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
