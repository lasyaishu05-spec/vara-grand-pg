import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(".");
const port = Number(process.env.PORT || 5173);
let attemptedPort = port;

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function renderIncludes(filePath, seen = new Set()) {
  if (seen.has(filePath)) {
    throw new Error(`Circular include detected for ${filePath}`);
  }

  seen.add(filePath);
  const html = readFileSync(filePath, "utf8");

  return html.replace(/<!--\s*@include\s+([^ ]+?)\s*-->/g, (_match, includePath) => {
    const resolvedInclude = resolve(join(root, includePath));

    if (!resolvedInclude.startsWith(root) || !existsSync(resolvedInclude)) {
      return `<!-- Missing include: ${includePath} -->`;
    }

    return renderIncludes(resolvedInclude, new Set(seen));
  });
}

const server = createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const requestedPath = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  let filePath = resolve(join(root, requestedPath));

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (url.pathname === "/" || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(root, "index.html");
  }

  const contentType = types[extname(filePath).toLowerCase()] || "application/octet-stream";

  if (extname(filePath).toLowerCase() === ".html") {
    try {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(renderIncludes(filePath));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(error.message);
    }

    return;
  }

  res.writeHead(200, { "Content-Type": contentType });
  createReadStream(filePath).pipe(res);
});

function listen(nextPort) {
  attemptedPort = nextPort;
  server.listen(nextPort, () => {
    console.log(`Vara PG site running at http://localhost:${nextPort}`);
  });
}

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    const nextPort = attemptedPort + 1;
    console.log(`Port ${attemptedPort} is busy, trying ${nextPort}...`);
    listen(nextPort);
    return;
  }

  throw error;
});

listen(port);
