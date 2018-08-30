// Requires text-diff.js

function dmp_to_objects(diffs) {
    return diffs.map(d=>{return {value:d[1], added:d[0]==1, removed:d[0]==-1};});
}

function diff_with_dmp(textA, textB){
    var dmp = new diff_match_patch();
    dmp.Diff_EditCost = 5;

    var diffs = dmp.diff_main(textA, textB);
    dmp.diff_cleanupEfficiency(diffs);
    let diff_objs = dmp_to_objects(diffs);
    return diff_objs;

}

function point_equals(a, b) {
    return a.x == b.x && a.y == b.y;
}

function merge_newlines(diffs) {
    let result = [];
    for (var i = 0; i < diffs.length; i++) {
        if (i < diffs.length-1){
            let curr_diff = diffs[i];
            let next_diff = diffs[i+1];
            if ((curr_diff.removed && next_diff.added) && (curr_diff.value[0] == "\n" && next_diff.value[0] == "\n")) {
                result.push({value:'\n', added:false, removed:false});
                result.push({value:curr_diff.value.substring(1), added:curr_diff.added, removed:curr_diff.removed});
                result.push({value:next_diff.value.substring(1), added:next_diff.added, removed:next_diff.removed});
                i++;
            }
            else result.push(curr_diff);
        }
        else result.push(diffs[i]);
    }
    return result;
}

function split_diffs(diffs) {
    let result = [];
    diffs.map(diff=>{
        let newline_index = diff.value.indexOf('\n');
        if (diff.value.length > 1 && newline_index != -1) {
            let elems = diff.value.split('\n');
            elems.map((e, index)=>{
                if (e != 0) result.push({value: e, added:diff.added, removed:diff.removed});
                if(index != elems.length-1) result.push({value: "\n", added:diff.added, removed:diff.removed});
            });
        }
        else{
            result.push(diff);
        }
    });
    return result;
}

function locate_point(initial, diffs) {
    let real_diffs = merge_newlines(diffs);
    real_diffs = split_diffs(real_diffs);

    var curr = {x:0 , y:0};
    curr.x = 0;
    let target = {x:initial.x , y:initial.y};
    let final = {x:initial.x , y:initial.y};
    let found = false;
    for (var i = 0; i < real_diffs.length; i++) {
        let diff = real_diffs[i];

        let added = diff.added;
        let removed = diff.removed;
        let unchanged = !(added || removed);
        let content = diff.value;

        // console.log({i:i, diff:diff, curr:{x:curr.x,y:curr.y}, target:{x:target.x,y:target.y}});

        if (content=='\n'){
            if (curr.y < target.y && removed) {
                target.y--;
            }
            else if (curr.y < target.y && added) {
                target.y++;
            }

            else if (curr.y == target.y && removed) {
                target.y--;
                console.warn("I'm not sure when this case would hit or what to do");
            }
            else if (curr.y == target.y && added) {
                // we added a newline before where we thought the point was
                // move the point left by the current line's length, then
                target.x -= curr.x;
                target.y++;
            }
            else if (curr.y == target.y && unchanged){
                // there was a newline on the line we thought the point should be
                // I guess it's here now?
                final.x = curr.x;
                final.y = curr.y;
                found = true;
                break;
            }

            if (added || unchanged){
                curr.y++;
                curr.x = 0;
            }
        }
        else {
            let c_len = content.length;
            let content_end = curr.x + c_len;
            if (curr.y == target.y) {
                if (content_end >= target.x && diff.removed){
                    final.x = curr.x;
                    final.y = curr.y;
                    found = true;
                    break;

                }
                else if (content_end > target.x && (unchanged)) {
                    // The spot we were looking for is in this segment,
                    final.x = target.x;
                    final.y = curr.y;
                    found = true;
                    break;
                }
                else if (/*content_end >= target.x &&*/ added) {
                    target.x += c_len;
                }

                // If the current segment is inserted/deleted before the point,
                //      then adjust the point accordingly
                if (content_end < target.x && (removed)){
                    target.x += (-1) * c_len;
                    // so if we remove a word len 5 then add a word len 3, we'll
                    //       end up moving the target up 2 characters
                }

            }
            curr.x += (added || unchanged)? c_len : 0;
        }

        if (curr.x > target.x && curr.y > target.y) {
            console.error("I don't believe this should happen");
            console.error(curr);
            console.error(target);
        }

    };

    if (!found) {
        console.error("Reached the end of the input without finding the point. It might be beyond the end of input.");
        final.x = final.y = -1;
    }

    return final;
}

function DiffSet(textA, textB){
    this._textA = textA;
    this._textB = textB;
    this._diffs = diff_with_dmp(this._textA, this._textB);
    this.translate_point = function (initial) {
        return locate_point(initial, this._diffs);
    };
}
