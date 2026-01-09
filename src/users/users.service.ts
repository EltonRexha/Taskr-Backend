import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersService {
  constructor(private prisma: DatabaseService) { }

  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          name: createUserDto.name,
        },
      });
      return user; // Return the created user object
    } catch (error) {
      // Handle errors (e.g., duplicate email)
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }


  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
