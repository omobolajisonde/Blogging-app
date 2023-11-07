class ApiFeatures {
  constructor(query, queryParams) {
    this.query = query;
    this.queryParams = queryParams;
  }
  filter() {
    const reservedKeys = [
      "page",
      "sort",
      "limit",
      "fields",
      "author_id",
      "author",
      "tags",
      "title",
    ];
    const queryFilter = { ...this.queryParams };
    // Filtering
    reservedKeys.forEach((key) => delete queryFilter[key]);
    this.query = this.query.find(queryFilter); // updates the query
    if (this.queryParams.author) {
      this.query = this.query.find({
        author: { $regex: this.queryParams.author, $options: "i" }, // return documents whose author field includes the author query params value
      });
    }
    if (this.queryParams.tags) {
      const tags = this.queryParams.tags.split(",").map((tag) => tag.trim());
      this.query = this.query.find({ tags: { $all: tags } }); // returns documents whose tags array contains the tags specifed in any order without regard to order or other elements in the array,
    }
    if (this.queryParams.title) {
      this.query = this.query.find({
        title: { $regex: this.queryParams.title, $options: "i" }, // return documents whose title field includes the title query params value
      });
    }
    return this;
  }
  sort() {
    if (this.queryParams.sort) {
      const sortBy = this.queryParams.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
  project() {
    // Projecting (Selecting only specific fields)
    if (this.queryParams.fields) {
      const fields = this.queryParams.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }
  paginate() {
    const page = this.queryParams.page || 1;
    const limit = this.queryParams.limit || 20;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFeatures;
