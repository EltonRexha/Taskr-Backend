import {
  BadRequestException,
  Controller,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { verifyWebhook } from '@clerk/backend/webhooks';
import { expressToFetchRequest } from './express-to-fetch';
import type { Request } from 'express';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('/clerk')
  async handleClerk(@Req() req: Request) {
    try {
      const fetchReq = expressToFetchRequest(req);

      const event = await verifyWebhook(fetchReq, {
        signingSecret: process.env.CLERK_WEBHOOK_SECRET!,
      });

      await this.webhooksService.handleClerkWebhook(event);

      return 'Webhook received';
    } catch (e) {
      this.logger.error('Webhook verification failed', e);
      throw new BadRequestException('Webhook verification failed');
    }
  }
}
