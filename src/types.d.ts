import { Application, Router } from "express";

export interface ITebexWebhookClientOptions{
  secret: string;
  express?: Application | Router;
  port?: number;
  endpoint?: string,
  ips?: string[];
}
