const http = require("http");
const { URL } = require("url");

const { normalizeViewName } = require("./lib/viewResolver");
const { loadTemplate } = require("./lib/templateLoader");

const host = process.env.HOST || "127.0.0.1";
const port = process.env.PORT || 3000;

const products = [
  { name: "Telemetry Dashboard", owner: "ops" },
  { name: "Incident Timeline", owner: "support" },
  { name: "Release Notifier", owner: "platform" }
];

function layout(title, body) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <style>
      body { font-family: sans-serif; margin: 2rem auto; max-width: 760px; line-height: 1.5; color: #18212b; }
      code { background: #f1f4f7; padding: 0.1rem 0.3rem; border-radius: 4px; }
      .card { border: 1px solid #d0d7de; border-radius: 10px; padding: 1rem; margin: 1rem 0; }
      input { padding: 0.5rem; width: 100%; max-width: 360px; }
      a { color: #005cc5; }
    </style>
  </head>
  <body>
    ${body}
  </body>
</html>`;
}

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function sendNotFound(res) {
  sendHtml(
    res,
    404,
    layout("Not Found", `<h1>Not Found</h1><p>The requested page does not exist.</p>`)
  );
}

function renderHome() {
  const productList = products
    .map((product) => `<li><strong>${product.name}</strong> <small>(${product.owner})</small></li>`)
    .join("");

  return layout(
    "Acme Support Portal",
    `<h1>Acme Support Portal</h1>
    <p>This is a small internal portal used by support engineers during incident triage.</p>

    <div class="card">
      <h2>Search products</h2>
      <form action="/search" method="GET">
        <input name="q" placeholder="search products">
      </form>
      <p>Try searching for <code>release</code> or <code>dashboard</code>.</p>
    </div>

    <div class="card">
      <h2>CMS preview</h2>
      <p>Preview internal help pages:</p>
      <ul>
        <li><a href="/cms/preview?view=home">Home preview</a></li>
        <li><a href="/cms/preview?view=help">Help preview</a></li>
        <li><a href="/cms/preview?view=status">Status preview</a></li>
      </ul>
    </div>

    <div class="card">
      <h2>Products</h2>
      <ul>${productList}</ul>
    </div>`
  );
}

function renderSearchPage(query) {
  const matches = products.filter((product) =>
    `${product.name} ${product.owner}`.toLowerCase().includes(query.toLowerCase())
  );

  const results =
    matches.length === 0
      ? "<li>No matches</li>"
      : matches.map((product) => `<li>${product.name} <small>(${product.owner})</small></li>`).join("");

  return layout(
    "Search Results",
    `<h1>Search Results</h1>
    <p>You searched for: ${query}</p>
    <ul>${results}</ul>
    <p><a href="/">Back</a></p>`
  );
}

const server = http.createServer((req, res) => {
  const currentUrl = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && currentUrl.pathname === "/") {
    return sendHtml(res, 200, renderHome());
  }

  if (req.method === "GET" && currentUrl.pathname === "/search") {
    const query = currentUrl.searchParams.get("q") || "";
    return sendHtml(res, 200, renderSearchPage(query));
  }

  if (req.method === "GET" && currentUrl.pathname === "/cms/preview") {
    try {
      const requestedView = currentUrl.searchParams.get("view") || "home";
      const viewName = normalizeViewName(requestedView);
      const template = loadTemplate(viewName);

      return sendHtml(
        res,
        200,
        layout(
          "CMS Preview",
          `<h1>CMS Preview</h1>
          <p>Rendering view: <code>${requestedView}</code></p>
          <div class="card">${template}</div>
          <p><a href="/">Back</a></p>`
        )
      );
    } catch (error) {
      return sendHtml(
        res,
        500,
        layout(
          "Preview Error",
          `<h1>Preview Error</h1><p>${error.message}</p><p><a href="/">Back</a></p>`
        )
      );
    }
  }

  return sendNotFound(res);
});

server.listen(port, host, () => {
  console.log(`Acme Support Portal listening on http://${host}:${port}`);
});
