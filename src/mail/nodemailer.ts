import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

export const nodeMailer = MailerModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    transport: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: configService.get<string>('MAIL_SENDER'),
        pass: configService.get<string>('MAIL_PASSWORD'),
      },
    },
    template: {
      dir: __dirname + './template/notification',
      adapter: new PugAdapter({ inlineCssEnabled: true }),
      options: {
        strict: true,
      },
    },
  }),
  inject: [ConfigService],
});
