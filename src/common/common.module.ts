import { Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { RequestApi } from './interfaces/api.response';

export { PrismaService, RequestApi };

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class CommonModule {}
