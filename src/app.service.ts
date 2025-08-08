import { Injectable } from '@nestjs/common';
import { Product } from './product.interface';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

