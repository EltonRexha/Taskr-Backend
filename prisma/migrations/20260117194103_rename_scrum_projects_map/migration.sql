/*
  Warnings:

  - You are about to drop the `scrum_Projects` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DraftSprint" DROP CONSTRAINT "DraftSprint_scrum_Project_id_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_scrum_Project_id_fkey";

-- DropForeignKey
ALTER TABLE "scrum_Projects" DROP CONSTRAINT "scrum_Projects_backlog_id_fkey";

-- DropForeignKey
ALTER TABLE "sprints" DROP CONSTRAINT "sprints_scrum_Project_id_fkey";

-- DropTable
DROP TABLE "scrum_Projects";

-- CreateTable
CREATE TABLE "scrum_projects" (
    "id" TEXT NOT NULL,
    "backlog_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scrum_projects_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "scrum_projects" ADD CONSTRAINT "scrum_projects_backlog_id_fkey" FOREIGN KEY ("backlog_id") REFERENCES "backlogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_scrum_Project_id_fkey" FOREIGN KEY ("scrum_Project_id") REFERENCES "scrum_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftSprint" ADD CONSTRAINT "DraftSprint_scrum_Project_id_fkey" FOREIGN KEY ("scrum_Project_id") REFERENCES "scrum_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_scrum_Project_id_fkey" FOREIGN KEY ("scrum_Project_id") REFERENCES "scrum_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
