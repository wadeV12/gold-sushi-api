export interface IMailService {
  sendMail(content: object): Promise<void>;
}
