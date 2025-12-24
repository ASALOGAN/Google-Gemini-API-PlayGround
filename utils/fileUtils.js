import fs from "fs";
import path from "path";

export function appendJSONL(filePath, data) {
  const line = JSON.stringify(data) + "\n";

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, line, "utf8");
}
