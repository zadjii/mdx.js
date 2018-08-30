// requires difftrack.js to be imported

function Mdx(mdxjson){
    this._initialText = null;
    this._text = null;
    this._comments = null;
    this._updated = false;

    if (mdxjson){
        if (mdxjson.text){
            this._text = mdxjson.text;
        }
        if (mdxjson.lastText){

        }
        // TODO: validate that each comment has a start and end point, and
        //      those points have a x and y
        if (mdxjson.comments) this._comments = mdxjson.comments;
    }

    this.comments = function () {
        return this._comments;
    }
    this.text = function () {
        return this._text;
    }

    this.addComment = function (start, end, text, metadata) {
        // TODO: validate that each comment has a start and end point, and
        //      those points have a x and y
        this._comments.push({start:start, end:end, text:text, metadata:metadata});
    }

    this.updateText = function (newText) {

    }

    this.export = function () {
        return {text:this._text, comments:this._comments};
    }
}

Mdx.import = function(text, comments){
    let mdxjson = {text:text, comments:comments};
    return new Mdx(mdxjson);
}
