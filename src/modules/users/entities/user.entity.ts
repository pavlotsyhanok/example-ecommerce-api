import { BaseEntity } from '../../../common/entities/base.entity';

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export class User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;

  constructor(partial: Partial<User> = {}) {
    super();
    Object.assign(this, partial);
    this.role = partial.role ?? UserRole.CUSTOMER;
    this.isActive = partial.isActive ?? true;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}