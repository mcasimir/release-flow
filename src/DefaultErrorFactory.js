export default class DefaultErrorFactory {
  create(message) {
    return new Error(message);
  }
}
