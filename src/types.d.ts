import { Application, Router } from "express";

export interface ITebexWebhookClientOptions{
  secret: string;
  express?: Application | Router;
  port?: number;
  endpoint?: string,
  ips?: string[];
}

export type TebexWebhookEvent = 
'payment.completed' | 
'payment.declined' | 
'payment.refunded' | 
'payment.dispute.opened' | 
'payment.dispute.won' | 
'payment.dispute.lost' | 
'payment.dispute.closed' | 
'recurring-payment.started' | 
'recurring-payment.renewed' | 
'recurring-payment.ended' | 
'recurring-payment.cancellation.requested' | 
'recurring-payment.cancellation.aborted' | 
'validation.webhook';
