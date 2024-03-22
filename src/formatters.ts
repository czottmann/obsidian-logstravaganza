import { mdtableFormatter } from "./formatters/mdtable";
import { ndjsonFormatter } from "./formatters/ndjson";

export const formatters = [
  mdtableFormatter,
  ndjsonFormatter,
]
  .sort((a, b) => a.title.localeCompare(b.title));

export function findFormatterByID(id: string) {
  return formatters.find((formatter) => formatter.id === id);
}
