export interface RadioFileParser {
  (filePath: string): number[];
}

export interface RadioFileTemplate {
  name: string;
  extensions: string[];
  parser: RadioFileParser;
}
