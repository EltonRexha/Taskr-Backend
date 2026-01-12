import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { DatabaseService } from 'src/database/database.service';

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

  update(id: number) {
    return `This action updates a #${id} user`;
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
