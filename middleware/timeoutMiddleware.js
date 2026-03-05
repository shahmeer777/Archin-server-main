// middleware/timeoutMiddleware.js

const timeoutMiddleware = (timeout = 60000) => {
  return (req, res, next) => {
    // Create a timeout promise that rejects after the given time
    req.timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeout)
    );
    next();
  };
};

export default timeoutMiddleware;
