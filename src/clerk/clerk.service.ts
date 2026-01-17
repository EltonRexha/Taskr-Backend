import { Injectable } from '@nestjs/common';
import {
  createClerkClient,
  EmailAddressJSON,
  WebhookEvent,
  verifyToken,
} from '@clerk/backend';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ClerkService {
  private readonly clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  constructor(private userService: UsersService) {}

  get clientInstance() {
    return this.clerkClient;
  }

  async getSession(token: string) {
    return await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
  }

  async getUser(userId: string) {
    return await this.clerkClient.users.getUser(userId);
  }

  private findPrimaryEmailAddress(
    email_addresses: EmailAddressJSON[],
    primary_email_address_id: string | null,
  ) {
    let primaryEmail = email_addresses.find(({ id }) => {
      return id === primary_email_address_id;
    })?.email_address;

    if (!primaryEmail) {
      primaryEmail = email_addresses[0].email_address;
      if (!primaryEmail) {
        throw new Error('No email provided');
      }
    }

    return primaryEmail;
  }

  async handleClerkUserCreated(event: WebhookEvent) {
    if (event.type !== 'user.created')
      throw new Error('Must be a user.created event');

    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
      primary_email_address_id,
    } = event.data;

    if (!first_name) {
      throw new Error('User not completed fully');
    }

    const lastName = last_name ?? undefined;

    const primaryEmail = this.findPrimaryEmailAddress(
      email_addresses,
      primary_email_address_id,
    );

    return await this.userService.create({
      clerkId: id,
      email: primaryEmail,
      firstName: first_name,
      lastName,
      profileImage: image_url,
    });
  }

  async handleClerkUserDeleted(event: WebhookEvent) {
    if (event.type !== 'user.deleted')
      throw new Error('Must be a user.deleted event');

    const { id } = event.data;

    if (!id) {
      throw new Error('Missing id to delete user');
    }

    return await this.userService.remove(id);
  }

  async handleClerkUserUpdated(event: WebhookEvent) {
    if (event.type !== 'user.updated')
      throw new Error('Must be a user.updated event');

    const {
      first_name,
      last_name,
      email_addresses,
      primary_email_address_id,
      image_url,
      id,
    } = event.data;

    if (!first_name) {
      throw new Error('First Name must be provided');
    }

    const primaryEmail = this.findPrimaryEmailAddress(
      email_addresses,
      primary_email_address_id,
    );
    const lastName = last_name ?? undefined;

    await this.userService.update({
      clerkId: id,
      email: primaryEmail,
      firstName: first_name,
      lastName,
      profileImage: image_url,
    });
  }
}
