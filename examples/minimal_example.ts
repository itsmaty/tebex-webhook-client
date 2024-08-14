import TebexWebhookClient from "tebex-webhook-client";
import { TebexWebhookRequestData } from "tebex-webhook-client";

const WebhookClient = new TebexWebhookClient({
  secret: process.env.TEBEX_WEBHOOK_SECRET
});

WebhookClient.Subscribe('payment.completed', (eventData: TebexWebhookRequestData, rawBody: string) => {
  console.log(`${eventData.customer.first_name} just bought ${eventData.products[0].name} for ${eventData.price.amount} €`);
});