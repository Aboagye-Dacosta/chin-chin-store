export class ErrorHandler extends Error {
  appMesssage: string;
  constructor(message: string = "sorry soemthing happend") {
      super(message);
      this.appMesssage = message;
  }
}
