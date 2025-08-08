import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateUserDto, UserRole } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';

@Injectable()
export class UsersService {
  private users: UserResponseDto[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+1234567890',
      role: UserRole.CUSTOMER,
      dateOfBirth: '1990-05-15',
      shippingAddress: '123 Main St, Apt 4B, New York, NY 10001, USA',
      billingAddress: '123 Main St, Apt 4B, New York, NY 10001, USA',
      marketingOptIn: true,
      isActive: true,
      emailVerified: true,
      lastLoginAt: '2024-01-20T09:15:00Z',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T14:45:00Z',
      orderCount: 5,
      totalSpent: 49995,
      formattedTotalSpent: '$499.95',
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      phoneNumber: '+1987654321',
      role: UserRole.CUSTOMER,
      dateOfBirth: '1985-08-22',
      shippingAddress: '456 Oak Ave, Suite 200, Los Angeles, CA 90210, USA',
      billingAddress: null,
      marketingOptIn: false,
      isActive: true,
      emailVerified: true,
      lastLoginAt: '2024-01-19T16:30:00Z',
      createdAt: '2024-01-10T08:15:00Z',
      updatedAt: '2024-01-19T16:30:00Z',
      orderCount: 3,
      totalSpent: 29997,
      formattedTotalSpent: '$299.97',
    },
    {
      id: 3,
      firstName: 'Admin',
      lastName: 'User',
      fullName: 'Admin User',
      email: 'admin@example.com',
      phoneNumber: null,
      role: UserRole.ADMIN,
      dateOfBirth: null,
      shippingAddress: null,
      billingAddress: null,
      marketingOptIn: false,
      isActive: true,
      emailVerified: true,
      lastLoginAt: '2024-01-22T10:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-22T10:00:00Z',
      orderCount: 0,
      totalSpent: 0,
      formattedTotalSpent: '$0.00',
    },
    {
      id: 4,
      firstName: 'Mike',
      lastName: 'Johnson',
      fullName: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      phoneNumber: '+1555123456',
      role: UserRole.CUSTOMER,
      dateOfBirth: '1992-12-03',
      shippingAddress: '789 Pine St, Unit 5, Chicago, IL 60601, USA',
      billingAddress: '789 Pine St, Unit 5, Chicago, IL 60601, USA',
      marketingOptIn: true,
      isActive: false,
      emailVerified: false,
      lastLoginAt: null,
      createdAt: '2024-01-18T14:20:00Z',
      updatedAt: '2024-01-21T11:45:00Z',
      orderCount: 1,
      totalSpent: 9999,
      formattedTotalSpent: '$99.99',
    },
  ];

  private nextId = 5;

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if email already exists
    const existingUser = this.users.find(u => u.email === createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate password strength (basic validation)
    if (!this.isPasswordStrong(createUserDto.password)) {
      throw new BadRequestException('Password does not meet security requirements');
    }

    const newUser: UserResponseDto = {
      id: this.nextId++,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      fullName: `${createUserDto.firstName} ${createUserDto.lastName}`,
      email: createUserDto.email,
      phoneNumber: createUserDto.phoneNumber || null,
      role: createUserDto.role || UserRole.CUSTOMER,
      dateOfBirth: createUserDto.dateOfBirth || null,
      shippingAddress: createUserDto.shippingAddress || null,
      billingAddress: createUserDto.billingAddress || null,
      marketingOptIn: createUserDto.marketingOptIn || false,
      isActive: true,
      emailVerified: false,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      orderCount: 0,
      totalSpent: 0,
      formattedTotalSpent: '$0.00',
    };

    this.users.push(newUser);
    return newUser;
  }

  async findAll(filters: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: UserResponseDto[]; meta: any }> {
    let filteredUsers = [...this.users];

    // Apply filters
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(u =>
        u.firstName.toLowerCase().includes(searchTerm) ||
        u.lastName.toLowerCase().includes(searchTerm) ||
        u.email.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.role) {
      filteredUsers = filteredUsers.filter(u => u.role === filters.role);
    }

    if (filters.isActive !== undefined) {
      filteredUsers = filteredUsers.filter(u => u.isActive === filters.isActive);
    }

    // Apply sorting
    if (filters.sortBy) {
      filteredUsers.sort((a, b) => {
        let aValue = a[filters.sortBy];
        let bValue = b[filters.sortBy];

        if (filters.sortBy === 'createdAt' || filters.sortBy === 'lastLoginAt') {
          aValue = aValue ? new Date(aValue).getTime() : 0;
          bValue = bValue ? new Date(bValue).getTime() : 0;
        }

        if (filters.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 10, 100);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return {
      data: paginatedUsers,
      meta: {
        total: filteredUsers.length,
        page,
        limit,
        totalPages: Math.ceil(filteredUsers.length / limit),
      },
    };
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserResponseDto> {
    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: Partial<CreateUserDto>): Promise<UserResponseDto> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email already exists (if being updated)
    if (updateUserDto.email) {
      const existingUser = this.users.find(u => u.email === updateUserDto.email && u.id !== id);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Validate password if being updated
    if (updateUserDto.password && !this.isPasswordStrong(updateUserDto.password)) {
      throw new BadRequestException('Password does not meet security requirements');
    }

    const existingUser = this.users[userIndex];
    const updatedUser: UserResponseDto = {
      ...existingUser,
      ...updateUserDto,
      fullName: updateUserDto.firstName || updateUserDto.lastName 
        ? `${updateUserDto.firstName || existingUser.firstName} ${updateUserDto.lastName || existingUser.lastName}`
        : existingUser.fullName,
      updatedAt: new Date().toISOString(),
    };

    // Don't include password in response
    delete (updatedUser as any).password;

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async remove(id: number): Promise<{ message: string; deletedId: number }> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Soft delete - deactivate user instead of removing
    this.users[userIndex].isActive = false;
    this.users[userIndex].updatedAt = new Date().toISOString();

    return {
      message: 'User account deleted successfully',
      deletedId: id,
    };
  }

  async updateLastLogin(id: number): Promise<void> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      this.users[userIndex].lastLoginAt = new Date().toISOString();
      this.users[userIndex].updatedAt = new Date().toISOString();
    }
  }

  async verifyEmail(id: number): Promise<UserResponseDto> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.users[userIndex].emailVerified = true;
    this.users[userIndex].updatedAt = new Date().toISOString();

    return this.users[userIndex];
  }

  async updateUserStats(userId: number, orderAmount: number): Promise<void> {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex].orderCount += 1;
      this.users[userIndex].totalSpent += orderAmount;
      this.users[userIndex].formattedTotalSpent = this.formatPrice(this.users[userIndex].totalSpent);
      this.users[userIndex].updatedAt = new Date().toISOString();
    }
  }

  async getUserOrders(userId: number, filters: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ data: any[]; meta: any }> {
    // This would typically fetch from an orders service
    // For now, return mock data
    const mockOrders = [
      {
        id: 1,
        orderNumber: 'ORD-2024-001',
        status: 'delivered',
        totalAmount: 19998,
        formattedTotalAmount: '$199.98',
        createdAt: '2024-01-15T14:30:00Z',
      },
      {
        id: 2,
        orderNumber: 'ORD-2024-002',
        status: 'shipped',
        totalAmount: 29997,
        formattedTotalAmount: '$299.97',
        createdAt: '2024-01-18T10:15:00Z',
      },
    ];

    let filteredOrders = mockOrders.filter(order => {
      // In a real implementation, this would filter by userId
      return true;
    });

    if (filters.status) {
      filteredOrders = filteredOrders.filter(order => order.status === filters.status);
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 10, 100);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    return {
      data: paginatedOrders,
      meta: {
        total: filteredOrders.length,
        page,
        limit,
        totalPages: Math.ceil(filteredOrders.length / limit),
      },
    };
  }

  private isPasswordStrong(password: string): boolean {
    // Basic password validation
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  private formatPrice(priceInCents: number): string {
    return `$${(priceInCents / 100).toFixed(2)}`;
  }
}
