class NoParserError extends Error {
  constructor(site, ...params) {
    super(...params);

    this.message = `Parser does not exist for ${site}`;
  }
}

export { NoParserError };
