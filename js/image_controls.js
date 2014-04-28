/*
 * 
 * Image Control Plugin; requires jQuery 1.4+
 * Lifan Zhang (lzhan65)@Emory BMI; Authored 4-17-2014
 * Currently works in Google Chrome / Chromium only; no other browser supports contrast/brightness/hue rotate/blur syntax in css
 * Newer specs may appear in https://dvcs.w3.org/hg/FXTF/raw-file/tip/filters/index.html , section 5
 * usage: image_transform_init('div_1','div_2'(,array_of_available_controls))
 * div1=id of div to be transformed
 * div2=id of div in which to inject the controls html
 * array_of_available_controls=any subset of ['contrast', 'brightness', 'saturate', 'hue_rotate', 'blur']; optional
 * if omitted, will show all controls
 * 
 */

var flt = [];
function changeFilter(filter, val, target) {
    flt[target][filter] = val;
    $('#' + target + '_' + filter + '_span').text(val);
    updateFilters(target);
}
function resetFilter(filter, target) {
    $('#' + target + '_' + filter).val(filter_defaults[filter][2]);
    $('#' + target + '_' + filter).change();
    return false;
}
function updateFilters(target) {
    //http://docs.webplatform.org/wiki/tutorials/css_filters
    //console.log(flt[target]);
    var mask_css = 'url(#f3) contrast(' + flt[target].contrast + '%) brightness(' + flt[target].brightness + '%) hue-rotate(' + flt[target].hue_rotate + 'deg) saturate(' + flt[target].saturate + '%) blur(' + flt[target].blur + 'px)';
    var css = 'contrast(' + flt[target].contrast + '%) brightness(' + flt[target].brightness + '%) hue-rotate(' + flt[target].hue_rotate + 'deg) saturate(' + flt[target].saturate + '%) blur(' + flt[target].blur + 'px)';
    //console.log(css);
    $('#' + target).css('-webkit-filter', css);
}
var filter_defaults = {'contrast': [0, 300, 100], 'brightness': [0, 300, 100], 'saturate': [0, 300, 100], 'hue_rotate': [0, 360, 0], 'blur': [0, 10, 0]};
function image_transform_init(target_div_name, control_div_name, filters_list) {
    if (target_div_name in flt) {
        console.log('image transformation controls already exist for div id=' + target_div_name);
        return;
    }
    flt[target_div_name] = {'contrast': 100, 'brightness': 100, 'saturate': 100, 'hue_rotate': 0, 'blur': 0};
    if (typeof filters_list === 'undefined') {
        filters_list = ['contrast', 'brightness', 'saturate', 'hue_rotate', 'blur'];
    }
    var all_filters = {'contrast': false, 'brightness': false, 'saturate': false, 'hue_rotate': false, 'blur': false};
    var html = '';
    for (var i = 0; i < filters_list.length; i++) {
        filters_list[i] = filters_list[i].toLowerCase();
    }
    html +='<table>';
    for (var i = 0; i < filters_list.length; i++) {
        if (filters_list[i] in all_filters && !all_filters[filters_list[i]]) {
            html +='<tr><td>';
            html += filters_list[i] + '</td><td> (<a href="javascript:;" onclick="resetFilter(\'' + filters_list[i] + '\',\'' + target_div_name + '\')">reset</a>)</td>';
            html += '<td><input type="range" class="image_control_slider" id=' + target_div_name + '_' + filters_list[i] + ' min=' + filter_defaults[filters_list[i]][0];
            html += ' max=' + filter_defaults[filters_list[i]][1] + ' value=' + filter_defaults[filters_list[i]][2] + ' onchange="changeFilter(\'' + filters_list[i] + '\',this.value,\'' + target_div_name + '\')"></td>';
            html += '<td><span id="' + target_div_name + '_' + filters_list[i] + '_span">' + filter_defaults[filters_list[i]][2] + '</span></td>';
            html +='</tr>';
        }
    }
    html +='</table>';
    $('#' + control_div_name).html(html);
    $('.image_control_slider').css({'width': '100px', 'display': 'inline'});
}
