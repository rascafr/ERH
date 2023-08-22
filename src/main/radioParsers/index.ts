import { extname } from 'path';
import parsers from './parsers/index';
import { RadioFileTemplate, RadioFileParser } from './radioFilesTemplate';

const registeredExtensions: Record<string, RadioFileParser> = {};

export function registerParser({
  name,
  parser,
  extensions,
}: RadioFileTemplate) {
  // eslint-disable-next-line no-console
  console.log('✅  Registering parser', name, 'for extensions', extensions);
  extensions.forEach((ext) => {
    registeredExtensions[ext] = parser;
  });
}

export function registerAll() {
  parsers.forEach((parser) => {
    registerParser(parser.register());
  });
}

export function parseRadioFile(filePath: string) {
  const ext = extname(filePath).replace('.', '').toLowerCase();
  if (!registeredExtensions[ext]) {
    throw new Error(
      `Cannot find any parser for extension "${ext}". Allowed: ${Object.keys(
        registeredExtensions
      ).join(', ')}`
    );
  }

  return registeredExtensions[ext](filePath);
}
