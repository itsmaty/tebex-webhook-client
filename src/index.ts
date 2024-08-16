import express from "express";
import bodyParser from "body-parser";
import { Application, Router, Request, Response } from "express";
import { createHash, createHmac } from "node:crypto";
import CreateExpressServer from "./utils/CreateExpressServer";
import { ITebexWebhookClientOptions, ProcessRequestDataResponse, TebexWebhookEventType, TebexWebhookRequest, TebexWebhookRequestData, TebexWebhookEventCallback } from "./types";

export default class TebexWebhookClient {

  /* the tebex webhook secret for validating signatures */
  private readonly secret: string;

  /* the express app or router to use */
  private readonly express: Application | Router | undefined;

  /* the port for the internal express server to listen on, if used */
  private readonly port: number = 80;

  /* the endpoint/route for incoming webhooks */
  private readonly endpoint: string = '/webhook';

  /* valid ip adresses for the webhooks */
  private readonly ips: string[] = ['129.213.15.18', '192.168.1.1'];

  /* if logging/console prints should be enabled */
  private debugLog: boolean = false;

  private EventSubscribers: { [key in TebexWebhookEventType]: TebexWebhookEventCallback[] } = {
    'payment.completed': [],
    'payment.declined': [],
    'payment.refunded': [],
    'payment.dispute.opened': [],
    'payment.dispute.won': [],
    'payment.dispute.lost': [],
    'payment.dispute.closed': [],
    'recurring-payment.started': [],
    'recurring-payment.renewed': [],
    'recurring-payment.ended': [],
    'recurring-payment.cancellation.requested': [],
    'recurring-payment.cancellation.aborted': [],
    'validation.webhook': []
  };

  constructor(options: ITebexWebhookClientOptions) {

    /* check if the options object was passed */
    if (!options) {
      /* if no options object was passed, throw an error */
      throw new Error('You need to pass an options object to the TebexWebhookClient');
    }

    /* check if logging should be enabled */
    this.debugLog = options.debugLog ?? this.debugLog;

    /* check if the secret was passed */
    if (!options.secret) {
      /* if no secret was passed, throw an error */
      throw new Error('You set the `secret` property in the options object passd to TebexWebhookClient');
    }

    /* save the secret in this instance */
    this.secret = options.secret;

    /* check if express use should be diabled */
    if (options.disableExpress) {

      /*
        if we dont want to use express server as request handler early return
        now only ProcessRequestData can be used (together with for example a nextjs project)
      */

      return;
    }

    /* check if an express instance is provided or if we have to create one */
    this.express = options.express ?? CreateExpressServer(options.port ?? this.port);

    /* check if and custom endpoint is provided or if we use the default */
    this.endpoint = options.endpoint ?? this.endpoint;

    /* check if the ip adresses have been overwitten */
    this.ips = options.ips ?? this.ips;

    /* create an express router */
    const Router: Router = express.Router();
    
    /* attach the body parser middleware to the router */
    Router.use(bodyParser.raw());

    /* attach the router to the express app or router */
    this.express.use(Router);

    /* register the endpoint on the router and provide the request handler */
    Router.post(this.endpoint, this.ReuquestHandler);

  }

  public Subscribe(EventName: TebexWebhookEventType, Callback: TebexWebhookEventCallback) {
    this.EventSubscribers[EventName].push(Callback);
  }

  private async ReuquestHandler(Request: Request, Response: Response) {
    /*
      extract the ip, signature & raw body from the request
      ts says that the headers can be strings | string[] | undefined
      but for sure they can only be string | undefined
      so we do as string because it gets checked for undefined later on in ProcessRequestData
    */

    const originIp: string = Request.headers['x-forwarded-for'] as string;
    const signatureHeader: string = Request.headers['X-Signature'] as string;
    const rawBody: string = Request.body;

    /* await the data processing */
    const response: ProcessRequestDataResponse = await this.ProcessRequestData(originIp, signatureHeader, rawBody);

    /* send the response */
    Response.status(response.status).send(response.message);
  }

  public async ProcessRequestData(originIp: string, signatureHeader: string, rawBody: string): Promise<ProcessRequestDataResponse> {

    /* validate if received args are not empty */
    if (!originIp || !signatureHeader || !rawBody) {
      return {
        error: true,
        status: 500,
        message: '500 INTERNAL_SERVER_ERROR'
      }
    }

    /* check origin ip adress agains tebex´s ip adresses */
    if (!this.ips.includes(originIp)) {
      return {
        error: true,
        status: 401,
        message: '401 UNAUTHORIZED'
      }
    }

    /* validate webhook signature */
    /* calculate the body hash */
    const bodyHash: string = createHash('sha256')
      .update(rawBody, 'utf-8')
      .digest('hex');

    /* calculate the signature for the webhook */
    const signature: string = createHmac('sha256', this.secret)
      .update(bodyHash)
      .digest('hex');

    /* validate the calculated signature against the signature header */
    if (signature !== signatureHeader) {
      /* if webhook is no valid tebex webhook, return unauthorized */
      return {
        error: true,
        status: 401,
        message: '401 UNAUTHORIZED'
      }
    }

    /* parse the body with json */
    let parsedBody: TebexWebhookRequest;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (error: any) {
      return {
        error: true,
        status: 400,
        message: '400 BAD_REQUEST'
      }
    }

    /* check if we have a validation webhook */
    if (parsedBody.type == 'validation.webhook') {

      /* if we have a validation webhook, return the validation response */
      return {
        error: false,
        status: 200,
        message: JSON.stringify({id: parsedBody.id})
      }
    }

    /* now check if we have any registered subscribers for the event */
    if (this.EventSubscribers[parsedBody.type]) {
      /* if we have any subscribers, call them */
      this.EventSubscribers[parsedBody.type].forEach(callback => callback(parsedBody.subject, rawBody));
    }
    

    /* if everything went fine, return 200 ok */
    return {
      error: false,
      status: 200,
      message: '200 OK'
    }

  }
}

export { ITebexWebhookClientOptions, ProcessRequestDataResponse, TebexWebhookEventType, TebexWebhookRequest, TebexWebhookRequestData, TebexWebhookEventCallback };