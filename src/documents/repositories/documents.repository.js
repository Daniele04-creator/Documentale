export function cloneDocument(document) {
  if (document === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(document));
}
