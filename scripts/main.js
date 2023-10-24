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

    const tagsText = state.tagFilterText;
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

    const orderedRules = orderRules([...state.filteredRules]);
    const flattenedRules = flattenOrder(orderedRules);
    const indentAmt = 1.5;
    flattenedRules.forEach(entry => {
        const indent = entry.indent * indentAmt;
        if (entry.type === "tag") {
            const tagElem = makeTag(entry.name);
            tagElem.style.float = "none";
            tagElem.style.width = `calc(100% - ${indent + 1.6}rem)`;
            tagElem.style.marginLeft = `${0.3 + indent}rem`;
            tagElem.style.fontWeight = "bold";
            tagElem.onclick = () => {
                const tag = state.getTag(entry.name);
                if (!tag) return;
                if (!state.unusedTags.includes(tag)) return;
                state.swapTag(tag);
            }
            rulesList.appendChild(tagElem);
        } else if (entry.type === "rule") {
            const ruleElem = makeRule(entry.rule.text);
            ruleElem.style.width = `calc(100% - ${indent + 1.4}rem)`;
            ruleElem.style.marginLeft = `${0.2 + indent}rem`;
            ruleElem.onclick = () => entry.rule.tags.map(name => state.getTag(name))
                .filter(tag => tag !== undefined)
                .filter(tag => state.unusedTags.includes(tag))
                .forEach(tag => state.swapTag(tag));
            rulesList.appendChild(ruleElem);
        }
    });
}
tagsSearch.oninput = () => state.setTagSearchText(tagsSearch.value.trim().toLowerCase());
rulesSearch.oninput = () => state.setSearchText(rulesSearch.value.trim().toLowerCase());

async function loadPage() {
    const rules = await loadRules();
    state = new State(rules, displayUI);
}

loadPage();