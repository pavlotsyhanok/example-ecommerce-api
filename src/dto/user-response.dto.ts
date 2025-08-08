import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from './create-user.dto';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'User full name (computed from first and last name)',
    example: 'John Doe',
  })
  fullName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'User phone number in international format',
    example: '+1234567890',
    nullable: true,
  })
  phoneNumber: string | null;

  @ApiProperty({
    description: 'User role in the system',
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  role: UserRole;

  @ApiProperty({
    description: 'User date of birth',
    example: '1990-05-15',
    format: 'date',
    nullable: true,
  })
  dateOfBirth: string | null;

  @ApiProperty({
    description: 'User shipping address',
    example: '123 Main St, Apt 4B, New York, NY 10001, USA',
    nullable: true,
  })
  shippingAddress: string | null;

  @ApiProperty({
    description: 'User billing address',
    example: '456 Oak Ave, Suite 200, Los Angeles, CA 90210, USA',
    nullable: true,
  })
  billingAddress: string | null;

  @ApiProperty({
    description: 'User preferences for marketing communications',
    example: true,
  })
  marketingOptIn: boolean;

  @ApiProperty({
    description: 'Indicates if the user account is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Indicates if the user email has been verified',
    example: true,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'Date when the user last logged in',
    example: '2024-01-20T09:15:00Z',
    format: 'date-time',
    nullable: true,
  })
  lastLoginAt: string | null;

  @ApiProperty({
    description: 'Date when the user account was created',
    example: '2024-01-15T10:30:00Z',
    format: 'date-time',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Date when the user account was last updated',
    example: '2024-01-20T14:45:00Z',
    format: 'date-time',
  })
  updatedAt: string;

  @ApiProperty({
    description: 'Total number of orders placed by the user',
    example: 5,
  })
  orderCount: number;

  @ApiProperty({
    description: 'Total amount spent by the user (in cents)',
    example: 49995,
  })
  totalSpent: number;

  @ApiProperty({
    description: 'Formatted total amount spent for display',
    example: '$499.95',
  })
  formattedTotalSpent: string;
}
