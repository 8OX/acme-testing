const fs = require("fs");
const path = require("path");

const templateRoot = path.join(__dirname, "..", "templates");

function loadTemplate(viewName) {
  const decodedViewName = decodeURIComponent(viewName);
  const templatePath = path.join(templateRoot, decodedViewName);

  return fs.readFileSync(templatePath, "utf8");
}

module.exports = {
  loadTemplate
};
