module.exports = (req, res, next) => {
  return res.status(200).json({
    status: "success",
    message:
      "Welcome to Blogging API 📝. Go to https://github.com/omobolajisonde/Blogging-app#api-reference` to find out all this API has to offer.",
  });
};
