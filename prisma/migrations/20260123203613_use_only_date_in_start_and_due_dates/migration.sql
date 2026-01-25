/*
  Warnings:

  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `scrum_task` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_scrum_Project_id_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_user_clerk_id_fkey";

-- DropForeignKey
ALTER TABLE "Project_members" DROP CONSTRAINT "Project_members_Project_id_fkey";

-- DropForeignKey
ALTER TABLE "Project_members" DROP CONSTRAINT "Project_members_user_clerk_id_fkey";

-- DropForeignKey
ALTER TABLE "_EpicToProjectMember" DROP CONSTRAINT "_EpicToProjectMember_B_fkey";

-- DropForeignKey
ALTER TABLE "_ProjectMemberToTask" DROP CONSTRAINT "_ProjectMemberToTask_A_fkey";

-- DropForeignKey
ALTER TABLE "scrum_task" DROP CONSTRAINT "scrum_task_backlogId_fkey";

-- DropForeignKey
ALTER TABLE "scrum_task" DROP CONSTRAINT "scrum_task_draft_sprint_id_fkey";

-- DropForeignKey
ALTER TABLE "scrum_task" DROP CONSTRAINT "scrum_task_epic_id_fkey";

-- DropForeignKey
ALTER TABLE "scrum_task" DROP CONSTRAINT "scrum_task_sprint_id_fkey";

-- DropForeignKey
ALTER TABLE "scrum_task" DROP CONSTRAINT "scrum_task_task_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_project_id_fkey";

-- AlterTable
ALTER TABLE "epics" ALTER COLUMN "start_date" SET DATA TYPE DATE,
ALTER COLUMN "due_date" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "sprints" ALTER COLUMN "start_date" SET DATA TYPE DATE,
ALTER COLUMN "due_date" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "tasks" ALTER COLUMN "start_date" SET DATA TYPE DATE,
ALTER COLUMN "due_date" SET DATA TYPE DATE;

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "Project_members";

-- DropTable
DROP TABLE "scrum_task";

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scrum_Project_id" TEXT NOT NULL,
    "Project_type" "ProjectType" NOT NULL,
    "user_clerk_id" TEXT,
    "starred" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_members" (
    "id" TEXT NOT NULL,
    "user_clerk_id" TEXT NOT NULL,
    "role" "ProjectMemberRole" NOT NULL,
    "Project_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scrum_tasks" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "epic_id" TEXT NOT NULL,
    "draft_sprint_id" TEXT,
    "sprint_id" TEXT,
    "backlogId" TEXT,
    "status" "ScrumTaskStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scrum_tasks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_scrum_Project_id_fkey" FOREIGN KEY ("scrum_Project_id") REFERENCES "scrum_projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_clerk_id_fkey" FOREIGN KEY ("user_clerk_id") REFERENCES "users"("clerk_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_clerk_id_fkey" FOREIGN KEY ("user_clerk_id") REFERENCES "users"("clerk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_Project_id_fkey" FOREIGN KEY ("Project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scrum_tasks" ADD CONSTRAINT "scrum_tasks_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scrum_tasks" ADD CONSTRAINT "scrum_tasks_epic_id_fkey" FOREIGN KEY ("epic_id") REFERENCES "scrum_epics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scrum_tasks" ADD CONSTRAINT "scrum_tasks_draft_sprint_id_fkey" FOREIGN KEY ("draft_sprint_id") REFERENCES "DraftSprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scrum_tasks" ADD CONSTRAINT "scrum_tasks_sprint_id_fkey" FOREIGN KEY ("sprint_id") REFERENCES "sprints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scrum_tasks" ADD CONSTRAINT "scrum_tasks_backlogId_fkey" FOREIGN KEY ("backlogId") REFERENCES "backlogs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EpicToProjectMember" ADD CONSTRAINT "_EpicToProjectMember_B_fkey" FOREIGN KEY ("B") REFERENCES "project_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectMemberToTask" ADD CONSTRAINT "_ProjectMemberToTask_A_fkey" FOREIGN KEY ("A") REFERENCES "project_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
