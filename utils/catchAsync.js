// This module just exports a function that handles async functions/handlers/controllers

module.exports = (fn) => {
  // accepts the async func as an arg.
  return (req, res, next) => {
    // returns another function which expects to be called with express req, res and next objects
    fn(req, res, next).catch(next); // the function calls the async function; "fn" and if any error occurs, the catch block calls the next function with the error as arg which will be handled by the global error handling middleware.
  };
};
