import { Module } from '@nestjs/common';
import { CrisisController } from './crisis.controller';
import { CrisisService } from './crisis.service';
import { CrisisPublisherService } from './crisis-publisher.service';

@Module({
  controllers: [CrisisController],
  providers: [CrisisService, CrisisPublisherService],
  exports: [CrisisService],
})
export class CrisisModule {}
