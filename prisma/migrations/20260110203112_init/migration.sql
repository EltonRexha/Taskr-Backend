-- CreateEnum
CREATE TYPE "ScrumTaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "SpaceType" AS ENUM ('SCRUM', 'KANBAN');

-- CreateEnum
CREATE TYPE "SpaceMemberRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "SprintStatus" AS ENUM ('COMPLETED', 'DUE');

-- CreateEnum
CREATE TYPE "EpicColor" AS ENUM ('RED', 'GREEN', 'ORANGE', 'YELLOW');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('Invitation');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "users" (
    "clerk_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("clerk_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "usersClerkId" TEXT NOT NULL,
    "notification_type" "NotificationType" NOT NULL,
    "description" TEXT NOT NULL,
    "meta_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backlogs" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backlogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "epics" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "epic_color" "EpicColor" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "epics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scrum_spaces" (
    "id" TEXT NOT NULL,
    "backlog_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scrum_spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sprints" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "sprintStatus" "SprintStatus" NOT NULL DEFAULT 'DUE',
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "scrum_space_id" TEXT NOT NULL,

    CONSTRAINT "sprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DraftSprint" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scrum_space_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DraftSprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scrum_epics" (
    "id" TEXT NOT NULL,
    "epic_id" TEXT NOT NULL,
    "sprint_id" TEXT,
    "draftSprintId" TEXT,
    "backlogId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scrum_epics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space" (
    "id" TEXT NOT NULL,
    "scrum_space_id" TEXT NOT NULL,
    "space_type" "SpaceType" NOT NULL,
    "user_clerk_id" TEXT NOT NULL,
    "starred" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "space_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_members" (
    "id" TEXT NOT NULL,
    "user_clerk_id" TEXT NOT NULL,
    "role" "SpaceMemberRole" NOT NULL,
    "space_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "space_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "user_clerk_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scrum_task" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "epic_id" TEXT NOT NULL,
    "draft_sprint_id" TEXT,
    "sprint_id" TEXT,
    "backlogId" TEXT,
    "status" "ScrumTaskStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scrum_task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EpicToSpaceMember" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EpicToSpaceMember_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SpaceMemberToTask" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SpaceMemberToTask_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EpicToSpaceMember_B_index" ON "_EpicToSpaceMember"("B");

-- CreateIndex
CREATE INDEX "_SpaceMemberToTask_B_index" ON "_SpaceMemberToTask"("B");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_usersClerkId_fkey" FOREIGN KEY ("usersClerkId") REFERENCES "users"("clerk_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scrum_spaces" ADD CONSTRAINT "scrum_spaces_backlog_id_fkey" FOREIGN KEY ("backlog_id") REFERENCES "backlogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_scrum_space_id_fkey" FOREIGN KEY ("scrum_space_id") REFERENCES "scrum_spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftSprint" ADD CONSTRAINT "DraftSprint_scrum_space_id_fkey" FOREIGN KEY ("scrum_space_id") REFERENCES "scrum_spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scrum_epics" ADD CONSTRAINT "scrum_epics_epic_id_fkey" FOREIGN KEY ("epic_id") REFERENCES "epics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scrum_epics" ADD CONSTRAINT "scrum_epics_sprint_id_fkey" FOREIGN KEY ("sprint_id") REFERENCES "sprints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scrum_epics" ADD CONSTRAINT "scrum_epics_draftSprintId_fkey" FOREIGN KEY ("draftSprintId") REFERENCES "DraftSprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scrum_epics" ADD CONSTRAINT "scrum_epics_backlogId_fkey" FOREIGN KEY ("backlogId") REFERENCES "backlogs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space" ADD CONSTRAINT "space_scrum_space_id_fkey" FOREIGN KEY ("scrum_space_id") REFERENCES "scrum_spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space" ADD CONSTRAINT "space_user_clerk_id_fkey" FOREIGN KEY ("user_clerk_id") REFERENCES "users"("clerk_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_user_clerk_id_fkey" FOREIGN KEY ("user_clerk_id") REFERENCES "users"("clerk_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_clerk_id_fkey" FOREIGN KEY ("user_clerk_id") REFERENCES "users"("clerk_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scrum_task" ADD CONSTRAINT "scrum_task_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scrum_task" ADD CONSTRAINT "scrum_task_epic_id_fkey" FOREIGN KEY ("epic_id") REFERENCES "scrum_epics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scrum_task" ADD CONSTRAINT "scrum_task_draft_sprint_id_fkey" FOREIGN KEY ("draft_sprint_id") REFERENCES "DraftSprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scrum_task" ADD CONSTRAINT "scrum_task_sprint_id_fkey" FOREIGN KEY ("sprint_id") REFERENCES "sprints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scrum_task" ADD CONSTRAINT "scrum_task_backlogId_fkey" FOREIGN KEY ("backlogId") REFERENCES "backlogs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EpicToSpaceMember" ADD CONSTRAINT "_EpicToSpaceMember_A_fkey" FOREIGN KEY ("A") REFERENCES "epics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EpicToSpaceMember" ADD CONSTRAINT "_EpicToSpaceMember_B_fkey" FOREIGN KEY ("B") REFERENCES "space_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SpaceMemberToTask" ADD CONSTRAINT "_SpaceMemberToTask_A_fkey" FOREIGN KEY ("A") REFERENCES "space_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SpaceMemberToTask" ADD CONSTRAINT "_SpaceMemberToTask_B_fkey" FOREIGN KEY ("B") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
