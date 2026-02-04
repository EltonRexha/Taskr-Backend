import 'dotenv/config';
import { faker } from '@faker-js/faker';
import {
  UserRole,
  NotificationType,
  EpicColor,
  SprintStatus,
  ProjectType,
  ProjectMemberRole,
  TaskLabel,
  TaskUrgency,
  ScrumTaskStatus,
  PrismaClient,
} from '../../prisma/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log('🌱 Starting database seeding...');

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  function randomDateThisMonth() {
    return faker.date.between({
      from: startOfMonth,
      to: endOfMonth,
    });
  }

  function randomDateUpToToday() {
    const today = new Date();
    const startOfTheYear = new Date(today.getFullYear(), 0, 1);
    return faker.date.between({
      from: startOfTheYear,
      to: today,
    });
  }

  // ----------------------
  // Users
  // ----------------------
  const users = await Promise.all([
    prisma.user.create({
      data: {
        clerkId: 'user_admin_001',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        profileImage: faker.image.avatar(),
        role: UserRole.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        clerkId: 'user_john_002',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        profileImage: faker.image.avatar(),
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        clerkId: 'user_jane_003',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        profileImage: faker.image.avatar(),
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        clerkId: 'user_mike_004',
        email: 'mike.johnson@example.com',
        firstName: 'Mike',
        lastName: 'Johnson',
        profileImage: faker.image.avatar(),
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        clerkId: 'user_sarah_005',
        email: 'sarah.williams@example.com',
        firstName: 'Sarah',
        lastName: 'Williams',
        profileImage: faker.image.avatar(),
        role: UserRole.USER,
      },
    }),
  ]);
  console.log(`✅ Created ${users.length} users`);

  // ----------------------
  // Notifications
  // ----------------------
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        userClerkId: users[1].clerkId,
        type: NotificationType.Invitation,
        description:
          'You have been invited to join E-Commerce Platform project',
        metaData: { projectId: 'project_001', invitedBy: users[0].clerkId },
      },
    }),
    prisma.notification.create({
      data: {
        userClerkId: users[2].clerkId,
        type: NotificationType.Invitation,
        description:
          'You have been invited to join Mobile App Redesign project',
        metaData: { projectId: 'project_002', invitedBy: users[0].clerkId },
      },
    }),
  ]);
  console.log(`✅ Created ${notifications.length} notifications`);

  // ----------------------
  // Backlogs & Scrum Projects
  // ----------------------
  const backlogs = await Promise.all([
    prisma.backlog.create({ data: {} }),
    prisma.backlog.create({ data: {} }),
  ]);

  const scrumProjects = await Promise.all(
    backlogs.map((b) =>
      prisma.scrumProject.create({ data: { backlogId: b.id } }),
    ),
  );

  // ----------------------
  // Projects (2)
  // ----------------------
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'E-Commerce Platform',
        scrumProjectId: scrumProjects[0].id,
        projectType: ProjectType.SCRUM,
        userClerkId: users[0].clerkId,
        starred: true,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Mobile App Redesign',
        scrumProjectId: scrumProjects[1].id,
        projectType: ProjectType.SCRUM,
        userClerkId: users[1].clerkId,
        starred: false,
      },
    }),
  ]);
  console.log(`✅ Created ${projects.length} projects`);

  // ----------------------
  // Project Members
  // ----------------------
  const projectMembers = await Promise.all([
    prisma.projectMember.create({
      data: {
        userClerkId: users[0].clerkId,
        role: ProjectMemberRole.ADMIN,
        projectId: projects[0].id,
      },
    }),
    prisma.projectMember.create({
      data: {
        userClerkId: users[1].clerkId,
        role: ProjectMemberRole.MEMBER,
        projectId: projects[0].id,
      },
    }),
    prisma.projectMember.create({
      data: {
        userClerkId: users[2].clerkId,
        role: ProjectMemberRole.VIEWER,
        projectId: projects[0].id,
      },
    }),
    prisma.projectMember.create({
      data: {
        userClerkId: users[1].clerkId,
        role: ProjectMemberRole.ADMIN,
        projectId: projects[1].id,
      },
    }),
    prisma.projectMember.create({
      data: {
        userClerkId: users[3].clerkId,
        role: ProjectMemberRole.VIEWER,
        projectId: projects[1].id,
      },
    }),
  ]);
  console.log(`✅ Created ${projectMembers.length} project members`);

  // ----------------------
  // Epics
  // ----------------------
  const epics = await Promise.all([
    prisma.epic.create({
      data: {
        description: 'Authentication & Accounts',
        color: EpicColor.RED,
        startDate: startOfMonth,
        dueDate: endOfMonth,
      },
    }),
    prisma.epic.create({
      data: {
        description: 'Checkout & Payments',
        color: EpicColor.GREEN,
        startDate: startOfMonth,
        dueDate: endOfMonth,
      },
    }),
  ]);
  console.log(`✅ Created ${epics.length} epics`);

  // ----------------------
  // Sprints
  // ----------------------
  const sprints = await Promise.all([
    prisma.sprint.create({
      data: {
        title: 'Sprint 1',
        startDate: startOfMonth,
        dueDate: addDays(startOfMonth, 14),
        description: 'Sprint 1',
        sprintStatus: SprintStatus.COMPLETED,
        scrumProjectId: scrumProjects[0].id,
      },
    }),
    prisma.sprint.create({
      data: {
        title: 'Sprint 2',
        startDate: addDays(startOfMonth, 15),
        dueDate: endOfMonth,
        description: 'Sprint 2',
        sprintStatus: SprintStatus.DUE,
        scrumProjectId: scrumProjects[0].id,
      },
    }),
  ]);
  console.log(`✅ Created ${sprints.length} sprints`);

  // ----------------------
  // Scrum Epics
  // ----------------------
  const scrumEpics = await Promise.all([
    prisma.scrumEpic.create({
      data: { epicId: epics[0].id, sprintId: sprints[0].id },
    }),
    prisma.scrumEpic.create({
      data: { epicId: epics[1].id, sprintId: sprints[1].id },
    }),
  ]);
  console.log(`✅ Created ${scrumEpics.length} scrum epics`);

  // ----------------------
  // Tasks (with title + description)
  // ----------------------
  const ecommerceMembers = projectMembers.filter(
    (pm) => pm.projectId === projects[0].id,
  );
  const TASK_COUNT = 20;

  const ecommerceTasks = await Promise.all(
    Array.from({ length: TASK_COUNT }).map(async () => {
      const mustBeBeforeToday = faker.datatype.boolean({ probability: 0.5 });
      const startDate = mustBeBeforeToday
        ? randomDateUpToToday()
        : randomDateThisMonth();
      const dueDate = addDays(startDate, faker.number.int({ min: 1, max: 7 }));
      const assignee = faker.helpers.arrayElement(ecommerceMembers);

      return prisma.task.create({
        data: {
          title: faker.company.catchPhrase(),
          description: faker.hacker.phrase(),
          label: faker.helpers.enumValue(TaskLabel),
          priority: faker.helpers.enumValue(TaskUrgency),
          projectId: projects[0].id,
          userClerkId: assignee.userClerkId,
          startDate,
          dueDate,
          assignedTo: { connect: [{ id: assignee.id }] },
        },
      });
    }),
  );

  const mobileMembers = projectMembers.filter(
    (pm) => pm.projectId === projects[1].id,
  );

  const mobileTasks = await Promise.all(
    Array.from({ length: 5 }).map(async () => {
      const mustBeBeforeToday = faker.datatype.boolean({ probability: 0.5 });
      const startDate = mustBeBeforeToday
        ? randomDateUpToToday()
        : randomDateThisMonth();
      const dueDate = addDays(startDate, faker.number.int({ min: 1, max: 7 }));
      const assignee = faker.helpers.arrayElement(mobileMembers);

      return prisma.task.create({
        data: {
          title: faker.company.catchPhrase(),
          description: faker.hacker.phrase(),
          label: faker.helpers.enumValue(TaskLabel),
          priority: faker.helpers.enumValue(TaskUrgency),
          projectId: projects[1].id,
          userClerkId: assignee.userClerkId,
          startDate,
          dueDate,
          assignedTo: { connect: [{ id: assignee.id }] },
        },
      });
    }),
  );

  const tasks = [...ecommerceTasks, ...mobileTasks];
  console.log(`✅ Created ${tasks.length} tasks`);

  // ----------------------
  // Scrum Tasks
  // ----------------------
  await Promise.all(
    tasks.map((task) =>
      prisma.scrumTask.create({
        data: {
          taskId: task.id,
          sprintId: faker.helpers.arrayElement(sprints).id,
          status: faker.helpers.enumValue(ScrumTaskStatus),
        },
      }),
    ),
  );
  console.log(`✅ Created ${tasks.length} scrum tasks`);

  console.log('\n🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
