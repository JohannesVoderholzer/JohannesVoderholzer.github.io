const hljs = require('highlight.js');
console.log("loaded blogCompiler.js");

function IsMatch(string, pattern, index){
  // returns true, if pattern is at position 'index' of string with a loop
  for (var i = 0; i < pattern.length; i++){
    if (index+i >= string.length || string[index+i] != pattern[i]){
      return false;
    }
  }
  return true;
}

function HandleHeader(input){
  return '<header>' + input.substring(2, input.length) + '</header>';
}

function HandleCodeSnippet(input){
  let snippetTemplate = GetTemplate('codeSnip');
  const code_raw = input.substring(4);
  snippetTemplate = snippetTemplate.replace("[codeRaw]", code_raw);
  const language = detectLanguage(code_raw);
  snippetTemplate = snippetTemplate.replace("[language]", language);
  //hljs.highlightElement(snippetElement.querySelector('pre').querySelector('code'));
  return snippetTemplate;
}

function detectLanguage(input) {
  const result = hljs.highlightAuto(input);
  return result.language;
}


function HandleBulletPoints(input){
  input = "\n" + input;
  const regex = /\n\s*[-*]\s/g;
  const matches = Array.from(input.matchAll(regex), match => match.index);
  matches.push(input.length);
  let result = "";
  let num_bullet_point = 0;
  for (var i = 0; i < matches.length-1; i++) {
    
    let match = matches[i];
    let next_match = matches[i+1];
    let space_ind = 1;
    while (input[match + space_ind] == " "){
      space_ind += 1;
    }
    space_ind -= 1;
    let extra_class = "";
    if (space_ind >= 10){
      extra_class = ' class="indent2"';
    }
    else if (space_ind >= 5){
      extra_class = ' class="indent1"';
    }

    let content = input.substring(match + space_ind + 3, next_match);
    let sign = input[match + space_ind + 1];
    

    if (sign == "*"){
      num_bullet_point += 1;
      content = htmlParser(content, true).replace("<p>", "").replace("</p>", "");
      content = '<bullet' + extra_class + '><b style="margin-right: 5px;">' + num_bullet_point.toString() + '. </b>' + content + '</bullet>';
      result = result + content;
    }
    else{
      content = htmlParser(content, true).replace("<p>", "").replace("</p>", "");
      content = '<bullet' + extra_class + '><svg class="svgBullet"><use href="./icons/icons.svg#bulletPoint" width="15"></use></svg>' + content + '</bullet>';
      result = result + content;
    }
  }
  return "<bulletPoints>" + result + "</bulletPoints>";
}

function HandleBlockquote(input){
  return '<blockQuote>' + input + '</blockQuote>';
}

let all_references = {};
let ref_number = 0;

function HandleReference(input){
  const raw_text = input.substring(2, input.length);
  let input_arguments = raw_text.split(",");
  let name = "";
  let authors = "";
  let link = "";
  let year = "";
  let text = "";
  input_arguments.forEach(argument => {
    let argument_split = argument.split("=");
    let key = argument_split[0].trim();
    let value = argument_split[1].trim();
    value = value.substring(1, value.length-1);
    if (key == "name"){
      name = value;
    }
    else if (key == "authors"){
      authors = value;
    }
    else if (key == "link"){
      link = ' href="'+ value + '"';
    }
    else if (key == "year"){
      year = value;
    }
    else if (key == "text"){
      text = value;
    }
  })
  // check if reference already seen:
  let ref_id = "";
  if (all_references[name] != null){
    ref_id = all_references[name][0];
  }
  else{
    ref_number += 1;
    ref_id = ref_number.toString();
    all_references[name] = [ref_id, name, authors, link, year];
  }
  
  return ' <a' + link + ' target="_blank" class="referenceText"><span>' + text + '</span><a href="#reference_' + ref_id + '" class="refSpan"><span>' + ref_id + '</span></a></a>';
}

function HandleImage(input) {
  const raw_text = input.substring(3, input.length);
  let input_arguments = raw_text.split(",");
  let size = "";
  let href = "";
  let caption = "";
  input_arguments.forEach(argument => {
    let argument_split = argument.split("=");
    let key = argument_split[0].trim();
    let value = argument_split[1].trim();
    value = value.substring(1, value.length - 1);
    if (key == "size") {
      size = value;
    } else if (key == "href") {
      href = value;
    } else if (key == "caption") {
      caption = value;
    }
  });
  let result = '<figure>';
  if (size) {
    result += '<img class="blogImage" src="' + href + '" width="' + size + '">';
  } else {
    result += '<img class="blogImage" src="' + href + '">';
  }
  if (caption) {
    result += '<figcaption>' + caption + '</figcaption>';
  }
  result += '</figure>';
  return result;
}

function htmlParser(input, is_inline=false){
  if (!is_inline){
    all_references = {};
  }
  ref_number = 0;
  let curr_pattern_index = null;
  let last_pattern_index = null;
  let curr_pattern_start = 0;
  let start_patterns = [["# ", " #\n", HandleHeader], ["```\n", "\n```", HandleCodeSnippet], 
                    ["- ", "\n\n", HandleBulletPoints], ["* ", "\n\n", HandleBulletPoints], ["\n> ", "\n\n", HandleBlockquote], 
                    ["#[", "]#", HandleReference], ["#I[", "]I#", HandleImage]];

  let output = "";

  for (var i = 0; i < input.length; i++) {
    if (curr_pattern_index == null){
      for (var patt_i = 0; patt_i < start_patterns.length; patt_i++){
        let this_patt = start_patterns[patt_i][0];
        if (IsMatch(input, this_patt, i)){
          let this_substr = input.substring(curr_pattern_start, i);
          if (last_pattern_index == null || start_patterns[last_pattern_index][0] != "#["){
            output = output + '<p>';
          }
          output = output + this_substr;
          if (this_patt != "#["){
            output = output + '</p>';
          }
          curr_pattern_index = patt_i;
          curr_pattern_start = i;
          i += this_patt.length-1;
        }
      }
    }
    else {
      let end_pattern = start_patterns[curr_pattern_index][1];
      if (IsMatch(input, end_pattern, i)){
        let handle_function = start_patterns[curr_pattern_index][2];
        let substr = input.substring(curr_pattern_start, i);
        output = output + handle_function(substr);
        curr_pattern_start = i+end_pattern.length;
        last_pattern_index = curr_pattern_index;
        curr_pattern_index = null;
        i += end_pattern.length-1;
      }
    }
  }
  let this_substr = input.substring(curr_pattern_start, input.length)
  if (last_pattern_index == null || start_patterns[last_pattern_index][0] != "#["){
    output = output + '<p>';
  }
  output += this_substr + '</p>';

  if (is_inline){
    return output;
  }

  // get length of all_references:
  let ref_length = 0;
  for (var key in all_references) {
    if (all_references.hasOwnProperty(key)) {
      ref_length += 1;
      break;
    }
  }

  if (ref_length == 1){
    output += '<div>';
    output += HandleHeader("  References");
  
    for (const key in all_references) {
      const snippetTemplate = GetTemplate('referenceSnip');
      const ref_data = all_references[key];
      const ref_id = ref_data[0];
      const ref_name = ref_data[1];
      const authors = ref_data[2];
      const link = ref_data[3];
      let year = ref_data[4];
      let authors_html = "";
      let authors_split = authors.split(" and ");

      for (let index = 0; index < authors_split.length; index++) {
        const author = authors_split[index];
        if (index == authors_split.length-1){
          authors_html += "<a>" + author + ". " + "</a>";
        }
        else{
          authors_html += "<a>" + author + ", " + "</a>";
        }
      }
      if (year != ""){
        year = " (" + year + ") "
      }
      let text_ = "<b>" + ref_id + "." + "</b>" + " " + authors_html + '<i>"' + ref_name + '"</i>' + year + '<a class="link" target="_blank"' + link + ">" + link.substring(7, link.length-1) + "</a>";
      let snippTemp = snippetTemplate.replace("[Example text]", text_);
      snippTemp = snippTemp.replace("[id here]", "reference_" + ref_id);
      output += snippTemp;
    }
  }
  // const html = "<html><head></head><body><div id='testdiv'>" + output + '</div></div></body></html>';
  const html = output;
  return html;
}

function convertToHtml(filePath, timediff) {
    let content = fs.readFileSync(filePath);
    content = content.toString().replace(/\r/g, '');
    return `<div id="creationDate">${timediff}</div>` + htmlParser("\n" + content + "\n\n");
}

function GetTemplate(name){
    if (name == "referenceSnip"){
      return `
<referenceSnip>
  <p id="[id here]" class="highlightFokus">
    [Example text]
  </p>
</referenceSnip>
`;
    }
    else if (name == "codeSnip"){
      return `
<codeSnip>
<div class="coolheader">
    <div id="languageDiv">[language]</div>
    <div>
        <button class="copyCodeButton socialMedia" style="padding:5px" data-title="copy code">
            <svg style="height:24px; width:24px;fill:var(--text-main);"><use href="./icons/icons.svg#copy" width="24"></use></svg>
        </button>
    </div>
</div>
<pre><code style="background-color: transparent;">[codeRaw]</code></pre>
</codeSnip>
`;
    }
}

module.exports = { htmlParser, convertToHtml };