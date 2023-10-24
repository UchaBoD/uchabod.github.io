const editRulesSearch = document.getElementById("editRulesSearch");
const editRulesList = document.getElementById("editRules");
const exportButton = document.getElementById("exportRules");

const editorContainer = document.getElementById("editorContainer");

const tagBankSearch = document.getElementById("bankSearch");
const newTagButton = document.getElementById("addNewTag");
const tagBank = document.getElementById("tagBank");
const ruleNewTags = document.getElementById("newTags");

const ruleTextarea = document.getElementById("ruleText");
const saveButton = document.getElementById("save");
const cancelButton = document.getElementById("cancel");

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