Make a page with a simpleMDE text editor

We'll want to manually set the font to monospace probably.

Two columns - 8+4

In the 8 side, put the text editor

in the 4 side, the list of comments

maybe 2 rows, each set to 50% height
top left is initial text
top right is pretty diff block

the text editor opens a file.mdx json file
(we'll just embed that as a variable value)

the file.mdx is
``` json
{
    text:string, // markdown content
    comments:{
        start:{x,y},
        end:{x,y},
        text:string,
        metadata:Object // eg username:string, posted:DateTime, state:int, etc
    }
}
```

Comments show up as boxes on the right column

if we select a comment, we'll select the text associated with the text range


We do this by storing the initial value of the doc
then diff it with the current contents,
then select the range between the two points


This seems like a solution I should be using vue for
like, there are comment components
with onclick events
though I guess I'm not dynamically re-calculating the new locations

If the point is abandoned (one of the coordinates is now -1,-1), then try to anchor it to the remaining one.
If the comment has no post-translation points, then display where it used to be started from as the anchor.


``` js
// Initialize a Mdx object with an existing mdx json file
let mdx = new Mdx(mdxjson);
// or alternatively, where comments is an appropriate comments objects
let mdx = Mdx.import(mdText, comments);

// Iterate over the comments in a file
mdx.comments().map(comment=>{console.log(comment);});

// add a comment to an mdx file
mdx.addComment(start, end, text, metadata);

// Update the locations of comments for a new text payload
mdx.updateText(newText);

// Return the json payload for this object for saving
// DO NOT use JSON.stringify()
mdx.export();

// alternatively, if you want to store markdown and comments seperately:
let text = mdx.text()
let comments = mdx.comments();
```


An Mdx should also have a lastText member
which it initializes on import and never changes, even across updateText() calls
when you export an Mdx, the

err

I want to be able to load an Mdx and already see the diff from the previous revision

then make some changes to it

then export it in a manner that can be reviewed

the reviewed version then gets commented on

and then the owner can open it up again and make edits

initialText, lastText, text?


initialText, lastText and text
prevText() = lastText if initialText
when you initialize the text
when you first updateText(), we'll move the current \_text into \_initialText
then change the value of \_text.

initialText() is the value at the last iteration
text() is the current iteration's value.

If you change the text, then the last iteration is the text when you loaded it.


#### 9 sept 2018
I don't think I like storing the mdx file as a json blob. That seems like it almost defeats the point
maybe it could be
``` md
<!--
{metadata:{}, comments:[]}
-->
{{text}}
```

