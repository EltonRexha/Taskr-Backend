import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

class UserDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', nullable: true, required: false })
  @IsString()
  @IsOptional()
  lastName?: string | null;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    nullable: false,
  })
  @IsString()
  @IsOptional()
  profileImage: string;
}

export class AssignedToDto {
  @ApiProperty({ type: UserDto })
  user: UserDto;
}
