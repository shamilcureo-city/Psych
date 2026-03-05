import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CrisisEvent {
  crisisEventId: string;
  clientId: string;
  sessionId?: string;
  flagType: string;
  severity: string;
  description?: string;
  timestamp: string;
}

/**
 * Crisis event publisher stub for Phase 1.
 *
 * Currently logs events. In production, this should publish to
 * Kafka topic `psychassess_crisis_flag` which triggers:
 * - notification-management service → clinician alerts
 * - communication-service → SMS/email to on-call counselor
 *
 * To enable Kafka, set KAFKA_BROKER and KAFKA_CRISIS_TOPIC env vars
 * and replace the log call with a KafkaProducer.send().
 */
@Injectable()
export class CrisisPublisherService {
  private readonly logger = new Logger(CrisisPublisherService.name);
  private readonly kafkaBroker: string | undefined;
  private readonly kafkaTopic: string;

  constructor(private readonly configService: ConfigService) {
    this.kafkaBroker = this.configService.get<string>('KAFKA_BROKER');
    this.kafkaTopic = this.configService.get<string>('KAFKA_CRISIS_TOPIC') || 'psychassess_crisis_flag';
  }

  async publish(event: CrisisEvent): Promise<void> {
    if (this.kafkaBroker) {
      // TODO: Initialize KafkaProducer in onModuleInit and publish here
      // const producer = this.kafka.producer();
      // await producer.send({ topic: this.kafkaTopic, messages: [{ value: JSON.stringify(event) }] });
      this.logger.log(
        `[KAFKA] Would publish to ${this.kafkaTopic}: ${JSON.stringify(event)}`,
      );
    } else {
      this.logger.warn(
        `[CRISIS EVENT] No Kafka broker configured. Event logged locally: ` +
        `client=${event.clientId} type=${event.flagType} severity=${event.severity}`,
      );
    }
  }
}
