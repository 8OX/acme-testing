function normalizeViewName(rawViewName) {
  const viewName = (rawViewName || "home").trim().replace(/\\/g, "/");
  const withoutParentRefs = viewName.replace(/\.\.\//g, "");

  if (withoutParentRefs.endsWith(".html")) {
    return withoutParentRefs;
  }

  return `${withoutParentRefs}.html`;
}

module.exports = {
  normalizeViewName
};
