function notFound(req, res) {
  res.status(404).json({ message: "Route not found" });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error.status === 400 && error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON request body" });
  }
  if (error.status === 413 && error.type === "entity.too.large") {
    return res.status(413).json({ message: "Request body is too large" });
  }
  if (error.name === "ValidationError") {
    return res.status(400).json({ message: error.message });
  }
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    return res.status(409).json({ message: `${field || "Value"} already exists` });
  }
  if (error.name === "CastError") {
    return res.status(400).json({ message: "Invalid identifier or field value" });
  }

  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
}

module.exports = { notFound, errorHandler };
