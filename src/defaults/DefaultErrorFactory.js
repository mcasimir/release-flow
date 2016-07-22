export default class DefaultErrorFactory {
  createError(message, data = {}) {
    let error = new Error(message);
    Object.assign(error, data);
    return error;
  }
}
