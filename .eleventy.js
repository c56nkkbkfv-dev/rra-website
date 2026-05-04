module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("uploads");

eleventyConfig.addCollection("stories", function(collectionApi) {
  return collectionApi.getFilteredByGlob("content/stories/*.md");
});
  
return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site"
    }
  };
};
