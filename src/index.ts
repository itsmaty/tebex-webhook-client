import { Application, Router } from "express";
import CreateExpressServer from "./utils/CreateExpressServer";
import { ITebexWebhookClientOptions } from "./types";

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
  private logging: boolean = false;

  /* the callback functions/subscribers for the events */
  private EventSubscribers: {[key: string]: Function[]} = {};

  constructor(options: ITebexWebhookClientOptions) {

    /* check if the options object was passed */
    if (!options) {
      /* if no options object was passed, throw an error */
      throw new Error('You need to pass an options object to the TebexWebhookClient');
    }

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


  }
}