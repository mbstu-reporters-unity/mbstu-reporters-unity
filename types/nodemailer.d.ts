declare module 'nodemailer' {
  export interface SendMailOptions {
    from?: string
    to?: string | string[]
    replyTo?: string
    subject?: string
    text?: string
    html?: string
    attachments?: Array<{
      filename?: string
      content?: Buffer | string
      contentType?: string
    }>
  }

  export interface Transporter {
    sendMail(options: SendMailOptions): Promise<unknown>
  }

  export function createTransport(options: {
    service?: string
    host?: string
    port?: number
    secure?: boolean
    auth?: {
      user: string
      pass: string
    }
  }): Transporter

  const nodemailer: {
    createTransport: typeof createTransport
  }
  export default nodemailer
}
