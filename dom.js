const unusedTags = document.getElementById("unusedTags");
const usedTags = document.getElementById("usedTags");
const rulesList = document.getElementById("rules");

const tagsSearch = document.getElementById("tagsSearch");
const rulesSearch = document.getElementById("rulesSearch");

function clearChildren(elem) {
    while (elem.lastChild) elem.removeChild(elem.lastChild);
}

function makeTag(text) {
    const tagElem = document.createElement("div");
    tagElem.className = "ruletag";
    tagElem.innerText = text;
    const colorClass = TAG_COLORS[text];
    if (colorClass) tagElem.className += ` ${colorClass}`;
    return tagElem;
}

function makeRule(text) {
    const ruleElem = document.createElement("div");
    ruleElem.className = "rule";
    ruleElem.innerText = text; 
    return ruleElem;
}