const unusedTags = document.getElementById("unusedTags");
const usedTags = document.getElementById("usedTags");
const rulesList = document.getElementById("rules");

const tagsSearch = document.getElementById("tagsSearch");
const rulesSearch = document.getElementById("rulesSearch");

const menuDiv = document.getElementById("menu");
const copyText = document.getElementById("copyText");
const copyLink = document.getElementById("copyLink");
const copyID = document.getElementById("copyID");

function clearChildren(elem) {
    while (elem.lastChild) elem.removeChild(elem.lastChild);
}

function makeTag(text) {
    const tagElem = document.createElement("div");
    tagElem.className = "ruletag";
    tagElem.innerText = text;
    const colorClass = TAG_COLORS[stripIndex(text)];
    if (colorClass) tagElem.className += ` ${colorClass}`;
    return tagElem;
}

function makeRule(text) {
    const ruleElem = document.createElement("pre");
    ruleElem.className = "rule";
    ruleElem.innerText = text; 
    return ruleElem;
}

function makeAddRuleButton() {
    const addElem = document.createElement("div");
    addElem.className = "rule addRule";
    addElem.innerText = "+";
    return addElem;
}