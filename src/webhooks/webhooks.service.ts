import { WebhookEvent } from '@clerk/backend';
import { Injectable } from '@nestjs/common';
import { ClerkService } from 'src/clerk/clerk.service';

@Injectable()
export class WebhooksService {
    constructor(private clerkService: ClerkService) { }

    async handleClerkWebhook(event: WebhookEvent) {
        switch (event.type) {
            case 'user.created':
                await this.clerkService.handleClerkUserCreated(event);
                break;
            case 'user.updated':
                await this.clerkService.handleClerkUserUpdated(event);
                break;
            case 'user.deleted':
                await this.clerkService.handleClerkUserDeleted(event);
                break;
        }
    }
}
