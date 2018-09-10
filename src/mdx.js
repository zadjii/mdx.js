// requires difftrack.js to be imported

function Mdx(mdxjson){
    this._initialText = null;
    this._text = null;
    this._comments = null;
    this._lastComments = null;
    this._updated = false;
    this._metadata = null;

    if (mdxjson){
        if (mdxjson.text){
            this._text = mdxjson.text;
        }
        if (mdxjson.lastText){
            this._initialText = mdxjson.lastText;
        }
        else {
            this._initialText = this._text;
        }
        // TODO: validate that each comment has a start and end point, and
        //      those points have a x and y
        if (mdxjson.comments) this._comments = mdxjson.comments;
        if (mdxjson.metadata) this._metadata = mdxjson.metadata;

        this._lastComments = this._comments;
    }

    this.comments = function () {
        return this._comments;
    }
    this.text = function () {
        return this._text;
    }
    this.lastText = function () {
        return this._initialText;
    }
    this.lastComments = function(){
        return this._lastComments;
    }

    this.addComment = function (start, end, text, metadata) {
        // TODO: validate that each comment has a start and end point, and
        //      those points have a x and y
        this._comments.push({start:start, end:end, text:text, metadata:metadata});
    }

    this.updateText = function (newText) {
        if (newText == this._text) return;
        if (!this._updated){
            this._initialText = this._text;
            this._updated = true;
        }
        // Replace our set of lastComments with the current comment locations
        this._lastComments = this._comments;
        // set our text to be the new text's value
        let lastText = this._text;
        this._text = newText;

        // calculate the new locations of each of the comments
        this._comments = [];
        let diffs = new DiffSet(lastText, newText);
        for (var i = 0; i < this._lastComments.length; i++) {
            let comment = this._lastComments[i];
            let newStart = diffs.translate_point(comment.start);
            let newEnd = diffs.translate_point(comment.end);
            // TODO handle points that are lost now (-1,-1)
            // TODO handle comments where both are abandoned
            this.addComment(newStart, newEnd, comment.text, comment.metadata);
        }
    }

    // this.export = function (exportLast) {
    //     let result = {text:this._text, comments:this._comments}
    //     if (exportLast){
    //         result.lastText = this._initialText;
    //     }
    //     return result;
    // }
    this.export = function (exportLast) {
        let metaObj = {comments:this._comments, metadata:this._metadata};
        // let result = {text:this._text, comments:this._comments}
        // if (exportLast){
        //     result.lastText = this._initialText;
        // }
        let fileText = "<!--\n" + JSON.stringify(metaObj) + "\n-->\n" + this._text;
        return fileText;
    }
    // {start:int. end:int} -> {start:Point. end:Point}
    this.selectionToPoints = function(selection){
        // Using the current text value, translate character indicies to x,y coords
        let startIndex = selection.start;
        let endIndex = selection.end;
        let current = {x:0,y:0};
        let startPoint = {x:-1,y:-1};
        let endPoint = {x:-1,y:-1};
        for (var charIndex = 0; charIndex < this._text.length; charIndex++) {
            let c = this._text[charIndex];
            if (charIndex == startIndex){
                startPoint.x = current.x;
                startPoint.y = current.y;
            }
            if (charIndex == endIndex){
                endPoint.x = current.x;
                endPoint.y = current.y;
            }
            if (charIndex >= startIndex && charIndex >= endIndex) break;
            if (c == '\n') {
                current.x = 0;
                current.y++;
            }
            else {
                current.x++;
            }
        }
        return {start:startPoint, end:endPoint};
    }
}

Mdx.create = function(text, comments, metadata, lastText){
    let mdxjson = {text:text, comments:comments};
    if (metadata){
        mdxjson.metadata = metadata;
    }
    if (lastText){
        mdxjson.lastText = lastText;
    }
    return new Mdx(mdxjson);
}

Mdx.import = function(fileText){
    // Scan the file for an opening <!-- and a closing -->\n
    // Include the \n in the closing search - we want the meta block to be
    //  cleanly at the top of the file, with the contents starting on the next line.
    let startTag = fileText.indexOf("<!--");
    let endTag = fileText.indexOf("-->\n");

    let text = null;
    let metaObj = null;

    if (startTag == -1 && endTag == -1){
        text = fileText;
        metaObj = {};
        // neither tag exists, this is okay
    }
    else if (startTag == -1){
        // No start tag but there was an end tag? that's invalid
    }
    else if (endTag == -1){
        // start but no end tag? that's invalid
    }
    else {
        // both tags, this is good
        let metaText = fileText.substring(startTag+4, endTag);
        let realText = fileText.substring(endTag+4);
        metaObj = JSON.parse(metaText);
        text = realText;
    }
    let mdxjson = metaObj;
    mdxjson.text = text;
    // let mdxjson = {text:text, comments:comments};
    // if (lastText){
    //     mdxjson.lastText = lastText;
    // }
    return new Mdx(mdxjson);
}

