let editorState = undefined; 
let currentRule = undefined;

/**
 * Loads all rules from github ref
 * @returns {Promise<RulesEntry[]>}
 */
async function loadRules() {
    const rulesResponse = await fetch("https://raw.githubusercontent.com/UchaBoD/rulebook/master/rules.json", {cache: "no-cache"});
    const rules = await rulesResponse.json();
    return rules;
}

function displayEditorUI(state) {
    clearChildren(editRulesList);
    clearChildren(tagBank);
    clearChildren(ruleNewTags);

    const addButton = makeAddRuleButton();
    addButton.onclick = () => {
        currentRule = undefined;
        showEditInterface();
    }
    editRulesList.appendChild(addButton);

    const tagsText = state.tagFilterText;
    state.unusedTags.forEach(tag => {
        if (tagsText.length > 0 && !tag.name.toLowerCase().includes(tagsText)) return;
        const tagElem = makeTag(tag.name);
        tagElem.onclick = () => state.swapTag(tag);
        tagBank.appendChild(tagElem);
    });
    state.usedTags.forEach(tag => {
        const tagElem = makeTag(tag.name);
        tagElem.onclick = () => {
            if (tag.count === 0) {
                state.removeTag(tag);
            } else {
                state.swapTag(tag);
            }
        }
        ruleNewTags.appendChild(tagElem);
    });
    state.filteredRules.forEach(rule => {
        const ruleElem = makeEditRule(rule.text);
        ruleElem.onclick = () => {
            currentRule = rule;
            rule.tags
                .map(tagName => state.getTag(tagName))
                .filter(tag => tag !== undefined)
                .forEach(tag => state.swapTag(tag));
            showEditInterface();
        };
        editRulesList.appendChild(ruleElem);
    });
}

tagBankSearch.oninput = () => editorState.setTagSearchText(tagBankSearch.value.trim().toLowerCase());
editRulesSearch.oninput = () => editorState.setSearchText(editRulesSearch.value.trim().toLowerCase());

function addNewTag(tagName) {
    editorState.addUsedTag({
        name: tagName,
        count: 0 // mark it as temporary
    });
    tagBankSearch.value = "";
    tagBankSearch.oninput();
}
newTagButton.onclick = () => addNewTag(tagBankSearch.value.trim());

function showEditInterface() {
    editRulesList.className = "hide";
    editRulesSearch.className = "hide";
    editorContainer.className = "";
    ruleTextarea.value = currentRule ? currentRule.text : "";
}
function hideEditInterface() {
    editorState.resetTags();
    editRulesList.className = "";
    editRulesSearch.className = "";
    editorContainer.className = "hide";
}
cancelButton.onclick = hideEditInterface;

saveButton.onclick = () => {
    exportButton.className = "";
    if (currentRule === undefined) {
        editorState.rules.addRule(ruleTextarea.value, editorState.usedTags);
    } else {
        editorState.rules.updateRule(currentRule.text, ruleTextarea.value, editorState.usedTags);
    }
    hideEditInterface();
}

function exportRules() {
    const tab = window.open(`${window.location.hostname}/rules.json`, 'NewRules');
    tab.document.write(`<pre>${editorState.rules.toJSON()}</pre>`);
    tab.document.close(); // finish loading the page
}
exportButton.onclick = exportRules;

async function loadPage() {
    const rules = await loadRules();
    editorState = new State(rules, displayEditorUI);
}

loadPage();