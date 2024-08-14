import express from 'express';
import { Application } from 'express';

export default function CreateExpressServer(port: number): Application {
  const ExpressServer: Application = express();

  ExpressServer.listen(port)

  return ExpressServer;
}