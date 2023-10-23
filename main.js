let state = undefined; 

/**
 * Loads all rules from github ref
 * @returns {Promise<RulesEntry[]>}
 */
async function loadRules() {
    const rulesResponse = await fetch("https://raw.githubusercontent.com/UchaBoD/rulebook/master/rules.json", {cache: "no-cache"});
    const rules = await rulesResponse.json();
    return rules;
}

/**
 * Clears and re-displays UI.
 * @param {State} state 
 */
function displayUI(state) {
    clearChildren(unusedTags);
    clearChildren(usedTags);
    clearChildren(rulesList);

    const tagsText = tagsSearch.value.trim().toLowerCase();

    state.unusedTags.forEach(tag => {
        if (tagsText.length > 0 && !tag.name.toLowerCase().includes(tagsText)) return;
        const tagElem = makeTag(tag.name);
        tagElem.onclick = () => state.swapTag(tag);
        unusedTags.appendChild(tagElem);
    });
    state.usedTags.forEach(tag => {
        const tagElem = makeTag(tag.name);
        tagElem.onclick = () => state.swapTag(tag);
        usedTags.appendChild(tagElem);
    });
    state.filteredRules.forEach(rule => {
        rulesList.appendChild(makeRule(rule.text));
    });
}
tagsSearch.oninput = () => displayUI(state);
rulesSearch.oninput = () => state.setSearchText(rulesSearch.value.trim().toLowerCase());

async function loadPage() {
    const rules = await loadRules();
    state = new State(rules, displayUI);
    displayUI(state);
}

loadPage();