const { DateTime } = require("luxon");
const CleanCSS = require("clean-css");
const UglifyJS = require("uglify-es");
const htmlmin = require("html-minifier");
const slugify = require("slugify");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");

const pluginSass = require("eleventy-plugin-sass");
const Image = require("@11ty/eleventy-img");

module.exports = function(eleventyConfig) { 


  // works also with addLiquidShortcode or addNunjucksAsyncShortcode
	eleventyConfig.addNunjucksAsyncShortcode("jpgImage", async function (
		src,
		alt,
		className
	) {
		let stats = await Image(src, {
			// Array of widths
			// Optional: use falsy value to fall back to native image size
			widths: [768, 992, null],

			// Pass any format supported by sharp
			formats: ["webp", "jpg"], //"png"

			// the directory in the image URLs <img src="/img/MY_IMAGE.png">
			urlPath: "/static/img/",

			// the path to the directory on the file system to write the image files to disk
			outputDir: "_site/static/img/",

			// eleventy-cache-assets
			// If a remote image URL, this is the amount of time before it downloads a new fresh copy from the remote server
			//  cacheDuration: "1d"
		});

		let lowestSrc = stats.jpg[0];
		let sizes = "100vw"; // Make sure you customize this!

		if (alt === undefined) {
			// You bet we throw an error on missing alt (alt="" works okay)
			throw new Error(`Missing \`alt\` on jpgImage from: ${src}`);
		}

		if (className !== undefined) {
			classHolder = ' class="' + className + '"';
		} else {
			classHolder = "";
		}

		// Iterate over formats and widths
		return (
			`
			<picture>
      ${Object.values(stats)
				.map((imageFormat) => {
					return `  <source type="image/${
						imageFormat[0].format
						}" srcset="${imageFormat
							.map((entry) => `${entry.url} ${entry.width}w`)
							.join(", ")}" sizes="${sizes}">`;
				})
				.join("\n")}

<img` +
			classHolder +
			` src="${lowestSrc.url}" width="${lowestSrc.width}" height="${lowestSrc.height}" alt="${alt}" loading="lazy" />
			</picture>
`
		);
	});



	eleventyConfig.addNunjucksAsyncShortcode("pngImage", async function (
		src,
		alt,
		className
	) {
		let stats = await Image(src, {
			// Array of widths
			// Optional: use falsy value to fall back to native image size
			widths: [768, 992, null],

			// Pass any format supported by sharp
			formats: ["webp", "png"], //"png"

			// the directory in the image URLs <img src="/img/MY_IMAGE.png">
			urlPath: "/img/",

			// the path to the directory on the file system to write the image files to disk
			outputDir: "_site/img/",

			// eleventy-cache-assets
			// If a remote image URL, this is the amount of time before it downloads a new fresh copy from the remote server
			//  cacheDuration: "1d"
		});

		let lowestSrc = stats.png[0];
		let sizes = "100vw"; // Make sure you customize this!

		if (alt === undefined) {
			// You bet we throw an error on missing alt (alt="" works okay)
			throw new Error(`Missing \`alt\` on jpgImage from: ${src}`);
		}

		if (className !== undefined) {
			classHolder = ' class="' + className + '"';
		} else {
			classHolder = "";
		}

		// Iterate over formats and widths
		return (
			`<picture>
      ${Object.values(stats)
				.map((imageFormat) => {
					return `  <source type="image/${
						imageFormat[0].format
						}" srcset="${imageFormat
							.map((entry) => `${entry.url} ${entry.width}w`)
							.join(", ")}" sizes="${sizes}">`;
				})
				.join("\n")}

<img` +
			classHolder +
			` src="${lowestSrc.url}" width="${lowestSrc.width}" height="${lowestSrc.height}" alt="${alt}" loading="lazy" />
			</picture>
`
		);
	});




	let sassPluginOptions = {
		watch: ["**/*.{scss,sass}", "!node_modules/**"],
		sourcemaps: true,
	};

	eleventyConfig.addPlugin(pluginSass, sassPluginOptions);



  // Eleventy Navigation https://www.11ty.dev/docs/plugins/navigation/
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  // Configuration API: use eleventyConfig.addLayoutAlias(from, to) to add
  // layout aliases! Say you have a bunch of existing content using
  // layout: post. If you don’t want to rewrite all of those values, just map
  // post to a new file like this:
  // eleventyConfig.addLayoutAlias("post", "layouts/my_new_post_layout.njk");

  // Merge data instead of overriding
  // https://www.11ty.dev/docs/data-deep-merge/
  eleventyConfig.setDataDeepMerge(true);

  // Date formatting (human readable)
  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj).toFormat("dd LLL yyyy");
  });

  // Date formatting (machine readable)
  eleventyConfig.addFilter("machineDate", dateObj => {
    return DateTime.fromJSDate(dateObj).toFormat("yyyy-MM-dd");
  });

  // Minify CSS
  // eleventyConfig.addFilter("cssmin", function(code) {
  //   return new CleanCSS({}).minify(code).styles;
  // });

  // Minify JS
  eleventyConfig.addFilter("jsmin", function(code) {
    let minified = UglifyJS.minify(code);
    if (minified.error) {
      console.log("UglifyJS error: ", minified.error);
      return code;
    }
    return minified.code;
  });

  // Minify HTML output
  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    if (outputPath.indexOf(".html") > -1) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }
    return content;
  });

  // Universal slug filter strips unsafe chars from URLs
  eleventyConfig.addFilter("slugify", function(str) {
    return slugify(str, {
      lower: true,
      replacement: "-",
      remove: /[*+~.·,()'"`´%!?¿:@]/g
    });
  });

  // Don't process folders with static assets e.g. images
  eleventyConfig.addPassthroughCopy("static/favicon");
	eleventyConfig.addPassthroughCopy("static/img");
	eleventyConfig.addPassthroughCopy("static/fonts");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("_includes/assets/");

  /* Markdown Plugins */
  let markdownIt = require("markdown-it");
  let markdownItAnchor = require("markdown-it-anchor");
  let options = {
    html: true,
    breaks: true,
    linkify: true
  };
  let opts = {
    permalink: false
  };

  eleventyConfig.setLibrary("md", markdownIt(options)
    .use(markdownItAnchor, opts)
  );

  return {
    templateFormats: ["md", "njk", "html", "liquid"],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about it.
    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: "/",

    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
