import { Mail, MailConfig } from './mail';

export class Ethereum {
  public mail: Mail;

  constructor(config: MailConfig) {
    this.mail = new Mail(config);
  }
}
