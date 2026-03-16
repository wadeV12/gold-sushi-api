import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IMailService } from './mailService.interface';
import { MailerService as MailerMain } from '@nestjs-modules/mailer';
// import * as pug from 'pug';

@Injectable()
export class MailService implements IMailService {
  constructor(private readonly mailerMain: MailerMain) {}

  async sendMail(datamailer): Promise<void> {
    const render = this._bodytemplete(
      datamailer.template,
      datamailer.dataTemplate,
    );
    await this._processSendEmail(datamailer.to, datamailer.subject, render);
  }

  _bodytemplete(template, data) {
    // return pug.renderFile(template, { data });
    return ''
  }

  async _processSendEmail(
    to: string,
    subject: string,
    body: string,
  ): Promise<void> {
    await this.mailerMain
      .sendMail({
        to: to,
        subject: subject,
        html: body,
      })
      .then(() => {
        console.log('Email sent');
      })
      .catch((e) => {
        console.log('Error sending email', e);
      });
  }
}

// TODO gen 24h emailverify verify token at createUser.interceptor and put to create-user-dto
