import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('products', () => {
    it('should return an array of products', () => {
      const result = appController.getProducts();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return products with correct structure', () => {
      const result = appController.getProducts();
      const firstProduct = result[0];
      
      expect(firstProduct).toHaveProperty('id');
      expect(firstProduct).toHaveProperty('name');
      expect(firstProduct).toHaveProperty('price');
      expect(firstProduct).toHaveProperty('description');
      expect(firstProduct).toHaveProperty('category');
      
      expect(typeof firstProduct.id).toBe('number');
      expect(typeof firstProduct.name).toBe('string');
      expect(typeof firstProduct.price).toBe('number');
      expect(typeof firstProduct.description).toBe('string');
      expect(typeof firstProduct.category).toBe('string');
    });
  });
});

