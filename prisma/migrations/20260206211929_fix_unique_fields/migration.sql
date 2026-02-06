/*
  Warnings:

  - A unique constraint covering the columns `[scrum_project_id]` on the table `projects` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[backlog_id]` on the table `scrum_projects` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "projects_scrum_project_id_key" ON "projects"("scrum_project_id");

-- CreateIndex
CREATE UNIQUE INDEX "scrum_projects_backlog_id_key" ON "scrum_projects"("backlog_id");
