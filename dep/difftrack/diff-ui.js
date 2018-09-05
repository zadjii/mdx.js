
function Point(x, y){
    this.x = x;
    this.y = y;
}

function PointColor(point, color){
    this.point = point;
    this.color = color;
}
function point_to_string(p) {
    return "(" + p.x + "," + p.y + ")";
}

function TextBlock(root, text, point_colors) {
    this._root = root;
    this._text = text;
    this._point_colors = point_colors.filter(a=>a.point.x != -1 && a.point.y != -1).sort((a, b)=>{
        if (a.point.y < b.point.y){ return -1;}
        else if (a.point.y > b.point.y){ return 1;}
        else {
            if (a.point.x < b.point.x){ return -1;}
            else if (a.point.x > b.point.x){ return 1;}
            else return 0;
        }
    });

    let _initialize = function (self) {
        let lines = self._text.split("\n");
        let pc_index = 0;
        let pc = self._point_colors.length > pc_index? self._point_colors[pc_index] : null;
        for (var row = 0; row < lines.length; row++) {
            let line = lines[row];
            if (pc != null && row == pc.point.y){
                let xs = [];
                let colors = [];

                for (var j = pc_index; j < self._point_colors.length; j++){
                    if (self._point_colors[j].point.y == row){
                        xs.push(self._point_colors[j].point.x);
                        colors.push(self._point_colors[j].color);
                    }
                    else if (self._point_colors[j].point.y > row) break;
                }

                pc_index += xs.length;
                pc = self._point_colors.length > pc_index? self._point_colors[pc_index] : null;

                if (xs.length > 0){
                    let next_index = 0;
                    let next_segment = "";
                    for (var char_index = 0; char_index < line.length; char_index++) {
                        let c = line[char_index];
                        if (char_index == xs[next_index]){
                            self._root.append($("<span>").text(next_segment));
                            self._root.append($("<span>").css("background", colors[next_index]).text(c));
                            // console.log(next_segment);
                            next_segment = "";
                            next_index++;
                            if (char_index == xs[next_index]){
                                console.warn("There is more than one point at the same location on line " + row);
                                console.warn(line);
                                console.warn(xs);
                                while(char_index == xs[next_index])
                                    next_index++;
                            }
                            if (next_index >= xs.length){
                                self._root.append($("<span>").text(line.substring(char_index+1)));
                            }
                        }
                        else {
                            next_segment += c;
                        }
                    }

                }
                else {
                    self._root.append($("<span>").text(line));
                }
            }
            else {
                self._root.append($("<span>").text(line));
                console.log(line);
            }
            self._root.append($("<br>"));
        }
    };
    _initialize(this);
}

function DiffPointsBlock(root, textA, textB, point_colors) {
    this._root = root;
    this._textA = textA;
    this._textB = textB;
    this._initial_point_colors = point_colors;
    let _initialize = function (self) {
        // var diff_words = JsDiff.diffWords(textA, textB);
        // var diff_words = JsDiff.diffWordsWithSpace(textA, textB);
        // var diff_chars = JsDiff.diffChars(textA, textB);
        // console.log(JsDiff.structuredPatch("", "", textA, textB, "", ""));
        var diff_dmp = diff_with_dmp(textA, textB);
        // var diff_lines = JsDiff.diffLines(textA, textB, {newlineIsToken:true});
        // var diff_lines = JsDiff.diffLines(textA, textB, false, true);
        // console.log(diff_words);

        // let final_point_colors = self._initial_point_colors.map(pc=>{return new PointColor(locate_point(pc.point, diff_words),  pc.color)});
        let final_point_colors = [self._initial_point_colors.map(pc=>{return new PointColor(new Point(-1, -1), pc.color);})];

        // let final_point_colors_by_chars = self._initial_point_colors.map(pc=>{return new PointColor(locate_point(pc.point, diff_chars),  pc.color)});
        let final_point_colors_by_chars = [self._initial_point_colors.map(pc=>{return new PointColor(new Point(-1, -1), pc.color);})];

        let final_point_colors_by_dmp = self._initial_point_colors.map(pc=>{return new PointColor(locate_point(pc.point, diff_dmp),  pc.color)});
        // let final_point_colors_by_lines = self._initial_point_colors.map(pc=>{return new PointColor(locate_point(pc.point, diff_lines),  pc.color)});

        // console.log(final_point_colors);
        // console.log(final_point_colors_by_chars);

        let table = $("<table>");
        self._root.append(table);
        let header = $("<tr>");
        table.append(header);
        header
            .append($("<th>").text("points"))
            .append($("<th>").text("initial text"))
            // .append($("<th>").text("diff by words"))
            // .append($("<th>").text("diff by chars"))
            .append($("<th>").text("diff by dmp"))
            ;
        let row = $("<tr>");
        table.append(row);
        let colA = $("<td>");
        let colB = $("<td>");
        // let colC = $("<td>");
        // let colD = $("<td>");
        let colE = $("<td>");
        row.append(colA);
        row.append(colB);
        // row.append(colC);
        // row.append(colD);
        row.append(colE);
        point_colors.map((pc,i)=>{
            colA.append(
                $("<div>")
                    .css("background", pc.color)
                    .text(point_to_string(pc.point) + " -> \n"
                          // + point_to_string(final_point_colors[i].point) + ", "
                          // + point_to_string(final_point_colors_by_chars[i].point) + ", "
                          + point_to_string(final_point_colors_by_dmp[i].point)// + ", "
                          )
            );
        });
        // let initial_pcs = points.map((p, index)=>{return new PointColor(p, colors[index]);});
        // let final_pcs = finals.map((p, index)=>{return new PointColor(p, colors[index]);});
        let blockA = new TextBlock(colB, textA, self._initial_point_colors);
        // let blockB = new TextBlock(colC, textB, final_point_colors);
        // let blockC = new TextBlock(colD, textB, final_point_colors_by_chars);
        let blockD = new TextBlock(colE, textB, final_point_colors_by_dmp);

    };
    _initialize(this);
}

function CommentedTextBlock(root, text, comment) {
    // TODO
    this._root = root;
    this._text = text;
    this._comment = comment;
    this.highlightColor = "#88aaff";
    let _initialize = function (self) {
        let currentHighlight = null;
        let start = self._comment.start;
        let end = self._comment.end;
        console.log({start:start, end:end});
        // Make the point at least one character wide
        // if (start.x == end.x && start.y == end.y)
            end.x++;
        let nextPoint = start;
        let lines = self._text.split("\n");

        let addText = function(str){
            let s = $("<span>").text(str);
            if (currentHighlight != null) s.css('background', currentHighlight);
            self._root.append(s);
        }

        for (var row = 0; row < lines.length; row++) {
            let line = lines[row];
            if (nextPoint && row == nextPoint.y) {
                // Case A: entire comment on this line, start highlight s.x to e.x
                if (currentHighlight == null && start.y == end.y){
                    console.log('case A');
                    let seg0 = line.substring(0, start.x);
                    let seg1 = line.substring(start.x, end.x);
                    let seg2 = line.substring(end.x);
                    addText(seg0);
                    currentHighlight = self.highlightColor;
                    addText(seg1);
                    currentHighlight = null;
                    addText(seg2);
                }
                // Case B: start  highlight on this line at s.x, end on another
                else if (currentHighlight == null){
                    console.log('case B');
                    let seg0 = line.substring(0, start.x);
                    let seg1 = line.substring(start.x);
                    addText(seg0);
                    currentHighlight = self.highlightColor;
                    addText(seg1);
                }
                // start.y == end.y && already started highligting is
                //      impossible, we'll do the entire line in case A
                // Case C: started highlighting already, ending highlight at end.x
                else { // start.y != end.y && already started highligting
                    console.log('case C');
                    let seg0 = line.substring(0, end.x);
                    let seg1 = line.substring(end.x);
                    addText(seg0);
                    currentHighlight = null;
                    addText(seg1);
                }
            }
            else {
                addText(line);
            }
            self._root.append($("<br>"));

        }



        // for (var i = 0; i < self._diffs.length; i++) {
        //     let diff = self._diffs[i];
        //     let lines = diff.value.split('\n');
        //     lines.map((line, index)=>{
        //         self._root.append(
        //             $("<span>")
        //                 .css("background", diff.added? ("#88ff88") : (diff.removed? ("#ff8888") : ("")))
        //                 .text(index < lines.length-1? (line + "\u240a") : (line))
        //         );
        //         if (index < lines.length-1) self._root.append($("<br>"));
        //     });
        // }
    };
    _initialize(this);
}



function DiffBlock(root, diffs) {
    this._root = root;
    this._diffs = diffs;
    let _initialize = function (self) {

        for (var i = 0; i < self._diffs.length; i++) {
            let diff = self._diffs[i];

            let lines = diff.value.split('\n');

            lines.map((line, index)=>{
                self._root.append(
                    $("<span>")
                        .css("background", diff.added? ("#88ff88") : (diff.removed? ("#ff8888") : ("")))
                        .text(index < lines.length-1? (line + "\u240a") : (line))
                );
                if (index < lines.length-1) self._root.append($("<br>"));
            });
        }
    };
    _initialize(this);
}

function DiffTable(root, textA, textB) {
    this._root = root;
    this._textA = textA;
    this._textB = textB;
    let _initialize = function (self) {
        // var diff_words = JsDiff.diffWordsWithSpace(textA, textB);
        // var diff_chars = JsDiff.diffChars(textA, textB);
        // var structured_diff = JsDiff.structuredPatch("", "", textA, textB, "", "");
        var diff_dmp = diff_with_dmp(textA, textB);
        // var diffs = JsDiff.diffWords(textA, textB);
        let table = $("<table>");
        self._root.append(table);
        let header = $("<tr>");
        table.append(header);
        header
            .append($("<th>").text("textA"))
            .append($("<th>").text("textB"))
            // .append($("<th>").text("diff by words"))
            // .append($("<th>").text("diff by chars"))
            .append($("<th>").text("diff by dmp"))
            ;
        let row = $("<tr>");
        table.append(row);
        let colA = $("<td>");
        let colB = $("<td>");
        let colC = $("<td>");
        let colD = $("<td>");
        let colE = $("<td>");
        row.append(colA);
        row.append(colB);
        // row.append(colC);
        // row.append(colD);
        row.append(colE);

        let blockA = new TextBlock(colA, textA, []);
        let blockB = new TextBlock(colB, textB, []);
        // new DiffBlock(colC, diff_words);
        // new DiffBlock(colD, diff_chars);
        new DiffBlock(colE, diff_dmp);

        // for (var h = 0; h < structured_diff.hunks.length; h++) {
        //     let hunk = structured_diff.hunks[h];
        //     for (var i = 0; i < hunk.lines.length; i++) {
        //         let line = hunk.lines[i];
        //         let added = line.length > 0 && line[0] == '+';
        //         let removed = line.length > 0 && line[0] == '-';
        //         colE.append(
        //             $("<span>")
        //                 .css("background", added? ("#88ff88") : (removed? ("#ff8888") : ("")))
        //                 .text(i < hunk.lines.length-1? (line + "\u240a") : (line))
        //         );
        //         if (i < hunk.lines.length-1) colE.append($("<br>"));
        //     }
        // }

    };
    _initialize(this);
}

function SingleDiffBlock(root, textA, textB) {
    this._root = root;
    this._textA = textA;
    this._textB = textB;
    let _initialize = function (self) {
        // var diff_words = JsDiff.diffWordsWithSpace(textA, textB);
        // var diff_chars = JsDiff.diffChars(textA, textB);
        // var structured_diff = JsDiff.structuredPatch("", "", textA, textB, "", "");
        var diff_dmp = diff_with_dmp(textA, textB);
        // var diffs = JsDiff.diffWords(textA, textB);
        let table = $("<table>");
        // self._root.append(table);
        let header = $("<tr>");
        table.append(header);
        header
            .append($("<th>").text("textA"))
            .append($("<th>").text("textB"))
            // .append($("<th>").text("diff by words"))
            // .append($("<th>").text("diff by chars"))
            .append($("<th>").text("diff by dmp"))
            ;
        let row = $("<tr>");
        table.append(row);
        let colA = $("<td>");
        let colB = $("<td>");
        let colC = $("<td>");
        let colD = $("<td>");
        let colE = $("<td>");
        row.append(colA);
        row.append(colB);
        // row.append(colC);
        // row.append(colD);
        row.append(colE);

        let blockA = new TextBlock(colA, textA, []);
        let blockB = new TextBlock(colB, textB, []);
        // new DiffBlock(colC, diff_words);
        // new DiffBlock(colD, diff_chars);
        new DiffBlock(self._root, diff_dmp);

        // for (var h = 0; h < structured_diff.hunks.length; h++) {
        //     let hunk = structured_diff.hunks[h];
        //     for (var i = 0; i < hunk.lines.length; i++) {
        //         let line = hunk.lines[i];
        //         let added = line.length > 0 && line[0] == '+';
        //         let removed = line.length > 0 && line[0] == '-';
        //         colE.append(
        //             $("<span>")
        //                 .css("background", added? ("#88ff88") : (removed? ("#ff8888") : ("")))
        //                 .text(i < hunk.lines.length-1? (line + "\u240a") : (line))
        //         );
        //         if (i < hunk.lines.length-1) colE.append($("<br>"));
        //     }
        // }

    };
    _initialize(this);
}
