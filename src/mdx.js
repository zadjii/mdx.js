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

    this.export = function (exportLast) {
        let result = {text:this._text, comments:this._comments}
        if (exportLast){
            result.lastText = this._initialText;
        }
        return result;
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

Mdx.import = function(text, comments, lastText){
    let mdxjson = {text:text, comments:comments};
    if (lastText){
        mdxjson.lastText = lastText;
    }
    return new Mdx(mdxjson);
}
