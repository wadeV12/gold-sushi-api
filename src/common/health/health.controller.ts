import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2026-03-16T10:00:00.000Z' },
        uptime: { type: 'number', example: 12345.67 },
        environment: { type: 'string', example: 'production' }
      }
    }
  })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is ready to accept traffic'
  })
  ready() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is alive'
  })
  live() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}

