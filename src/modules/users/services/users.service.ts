import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dto';

@Injectable()
export class UsersService {
  private users: User[] = [];

  constructor() {
    this.seedData();
  }

  private seedData(): void {
    const seedUsers = [
      {
        id: uuidv4(),
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        isActive: true,
      },
      {
        id: uuidv4(),
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CUSTOMER,
        isActive: true,
      },
      {
        id: uuidv4(),
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.CUSTOMER,
        isActive: true,
      },
    ];

    this.users = seedUsers.map(user => new User(user));
  }

  async findAll(): Promise<User[]> {
    return this.users.filter(user => user.isActive);
  }

  async findOne(id: string): Promise<User> {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email === email) || null;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = new User({
      id: uuidv4(),
      ...createUserDto,
    });

    this.users.push(user);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const existingUser = this.users[userIndex];
    const updatedUser = new User({
      ...existingUser,
      ...updateUserDto,
    });
    updatedUser.updateTimestamp();

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    this.users[userIndex].isActive = false;
    this.users[userIndex].updateTimestamp();
  }
}