import { Application, Router } from "express";

export interface ITebexWebhookClientOptions{
  secret: string;
  express?: Application | Router;
  port?: number;
  endpoint?: string,
  ips?: string[],
  disableExpress?: boolean,
  debugLog?: boolean
}

export type ProcessRequestDataResponse = {
  error: boolean;
  status: number;
  message: string;
}

export type TebexWebhookRequest = {
  id: string,
  type: TebexWebhookEventType,
  subject: TebexWebhookRequestSubject,
}

export type TebexWebhookRequestSubject = any;

export type TebexWebhookEventCallback = (eventData: TebexWebhookRequestSubject, rawBody: string) => void;

export type TebexWebhookEventType = 
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
