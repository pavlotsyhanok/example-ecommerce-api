import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Example E-commerce API')
    .setDescription(`
      A comprehensive e-commerce API built with NestJS that provides endpoints for managing products, users, orders, and categories.
      
      ## Features
      - Product catalog management
      - User authentication and management
      - Order processing and tracking
      - Category organization
      - RESTful API design with comprehensive documentation
      
      ## Authentication
      This API uses Bearer token authentication for protected endpoints.
    `)
    .setVersion('1.0.0')
    .setContact(
      'API Support',
      'https://example.com/support',
      'support@example.com'
    )
    .setLicense(
      'MIT',
      'https://opensource.org/licenses/MIT'
    )
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://api.example.com', 'Production server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API Key for authentication',
      },
      'API-Key'
    )
    .addTag('app', 'Application health and info endpoints')
    .addTag('products', 'Product management endpoints')
    .addTag('users', 'User management and authentication endpoints')
    .addTag('orders', 'Order processing and management endpoints')
    .addTag('categories', 'Product category management endpoints')
    .addGlobalParameters({
      name: 'Accept-Language',
      in: 'header',
      required: false,
      description: 'Language preference for response content',
      schema: {
        type: 'string',
        default: 'en-US',
        example: 'en-US',
      },
    })
    .addGlobalResponse(400, {
      description: 'Bad Request - Invalid input data',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'number', example: 400 },
              message: { 
                oneOf: [
                  { type: 'string' },
                  { type: 'array', items: { type: 'string' } }
                ],
                example: 'Validation failed'
              },
              error: { type: 'string', example: 'Bad Request' },
              timestamp: { type: 'string', format: 'date-time' },
              path: { type: 'string', example: '/api/products' }
            }
          }
        }
      }
    })
    .addGlobalResponse(401, {
      description: 'Unauthorized - Authentication required',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'number', example: 401 },
              message: { type: 'string', example: 'Unauthorized' },
              error: { type: 'string', example: 'Unauthorized' },
              timestamp: { type: 'string', format: 'date-time' },
              path: { type: 'string', example: '/api/products' }
            }
          }
        }
      }
    })
    .addGlobalResponse(403, {
      description: 'Forbidden - Insufficient permissions',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'number', example: 403 },
              message: { type: 'string', example: 'Forbidden resource' },
              error: { type: 'string', example: 'Forbidden' },
              timestamp: { type: 'string', format: 'date-time' },
              path: { type: 'string', example: '/api/products' }
            }
          }
        }
      }
    })
    .addGlobalResponse(404, {
      description: 'Not Found - Resource does not exist',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'number', example: 404 },
              message: { type: 'string', example: 'Resource not found' },
              error: { type: 'string', example: 'Not Found' },
              timestamp: { type: 'string', format: 'date-time' },
              path: { type: 'string', example: '/api/products/999' }
            }
          }
        }
      }
    })
    .addGlobalResponse(500, {
      description: 'Internal Server Error - Something went wrong',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'number', example: 500 },
              message: { type: 'string', example: 'Internal server error' },
              error: { type: 'string', example: 'Internal Server Error' },
              timestamp: { type: 'string', format: 'date-time' },
              path: { type: 'string', example: '/api/products' }
            }
          }
        }
      }
    })
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    deepScanRoutes: true,
  });

  SwaggerModule.setup('api', app, documentFactory, {
    customSiteTitle: 'E-commerce API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 50px 0 }
      .swagger-ui .info .title { color: #3b82f6 }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
    },
  });

  console.log(`🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📚 API Documentation available at: http://localhost:${process.env.PORT ?? 3000}/api`);
  console.log(`📋 API JSON available at: http://localhost:${process.env.PORT ?? 3000}/api-json`);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();


