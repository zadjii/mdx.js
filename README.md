# mdx.js

Markdown with commenting.

This is a simple way to add some extended metadata to markdown files. `.mdx`
    files are plain old markdown documents with some embedded metadata in a HTML
    comment at the top of the file. This means that most markdown renderers will
    be able to render an `mdx` file just the same as a normal markdown document,
    but `mdx`-enabled editors can add extra data to the file in a unified way.

I built this because I wanted a good way of editing and reviewing markdown
    files. I wanted to be able to embed comments into the document, and track
    those comments locations over multiple revisions. Too often have I found
    myself leaving a comment on a doc that undergoes a big change, and Word will
    just delete the comment when the text it's anchored to is deleted.

That's dumb.

So you can use mdx to embed the comments in the doc, then iteratively move the
    comments as the text changes. These comments' positions are tracked using
    [difftrack.js](https://github.com/zadjii/difftrack).

## Using mdx.js


### Initialization
``` js
// initialize an Mdx object using an existing .mdx file
let mdx = Mdx.import(mdxFileData);

// Alternatively, if you already have some markdown text and possibly comments
//      or metadata you'd like to add to it, use Mdx.create
mdx = Mdx.create(text, comments, metadata)

// If you'd already got an mdx json blob, you can also initialize the object
//      directly like so:
let mdxjson = {text:"", comments:[], metadata:{}};
let mdx = new Mdx(mdxjson);
```

### Work with the object
``` js
// Iterate over the comments in a file
mdx.comments().map(comment=>{console.log(comment);});

// add a comment to an mdx file
mdx.addComment(start, end, text, metadata);

// Update the locations of comments for a new text payload
mdx.updateText(newText);

// get & manipulate any metadata associated with the file
let metadata = mdx.metadata();
metadata.title = "This is my mdx document";
metadata.createdOn = JSON.stringify(new Date());
```

### Save the mdx file

``` js
// Return the text of the mdx file for saving
// DO NOT use JSON.stringify()
mdx.export();

// alternatively, if you want to get at the text, comments, metadata, etc:
let text = mdx.text()
let comments = mdx.comments();
let metadata = mdx.metadata();
```
