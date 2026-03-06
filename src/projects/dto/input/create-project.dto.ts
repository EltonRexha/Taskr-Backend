import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ProjectMemberRole, ProjectType } from 'prisma/generated/prisma/enums';

export class InviteMemberDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'The email of the member to invite' })
  email!: string;

  @IsEnum(ProjectMemberRole)
  @IsNotEmpty()
  @ApiProperty({ description: 'The role of the member to invite' })
  role!: ProjectMemberRole;
}

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The name of the project' })
  name!: string;

  @IsEnum(ProjectType)
  @ApiProperty({ description: 'The type of the project' })
  type!: ProjectType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InviteMemberDto)
  @ApiProperty({
    description: 'The members to invite to the project',
    type: [InviteMemberDto],
  })
  invites!: InviteMemberDto[];
}
