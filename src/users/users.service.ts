import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { DatabaseService } from 'src/database/database.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: DatabaseService) { }

  async create(createUserDto: CreateUserDto) {
    try {
      const user = this.prisma.user.create({
        data: {
          clerkId: createUserDto.clerkId,
          email: createUserDto.email,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          profileImage: createUserDto.profileImage
        }
      })
      return user;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }


  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(updateUserDto: UpdateUserDto) {
    try {
      const user = this.prisma.user.update({
        where: {
          clerkId: updateUserDto.clerkId
        },
        data: {
          email: updateUserDto.email,
          firstName: updateUserDto.firstName,
          lastName: updateUserDto.lastName,
          profileImage: updateUserDto.profileImage
        }
      })
      return user;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  remove(clerkId: string) {
    try {
      const user = this.prisma.user.delete({
        where: {
          clerkId
        }
      })
      return user;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}
