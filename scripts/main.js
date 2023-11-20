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
 * Sets the given rule's tags to be shown in the tag selection area.
 * @param {RulesEntry} rule 
 * @param {State} state
 */
function setTagsShown(rule, state) {
    rule.tags.map(name => state.getTag(name))
        .filter(tag => tag !== undefined)
        .filter(tag => state.unusedTags.includes(tag))
        .forEach(tag => state.swapTag(tag));
}

/**
 * Shows a menu for copying things from a given rule.
 * @param {number} x 
 * @param {number} y 
 * @param {RulesEntry} rule 
 */
function showMenu(x, y, rule) {
    menuDiv.style.top = `${y}px`;
    menuDiv.style.left = `${x}px`;
    menuDiv.style.visibility = "visible";
    menuDiv.style.opacity = "1";

    copyText.onclick = () => navigator.clipboard.writeText(rule.text);
    copyLink.onclick = () => {
        const url = new URL(window.location.href);
        url.searchParams.set("id", rule.id);
        navigator.clipboard.writeText(url.toString());
    }
    copyID.onclick = () => navigator.clipboard.writeText(rule.id);
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
        tagElem.onclick = () => {
            state.swapTag(tag);
            tagsSearch.value = "";
            tagsSearch.oninput();
        }
        unusedTags.appendChild(tagElem);
    });
    state.usedTags.forEach(tag => {
        const tagElem = makeTag(tag.name);
        tagElem.onclick = () => state.swapTag(tag);
        usedTags.appendChild(tagElem);
    });

    const orderedRules = orderRules([...state.filteredRules], state.collapsedSections);
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
            tagElem.onclick = () => state.toggleCollapsed(entry.path);
            rulesList.appendChild(tagElem);
        } else if (entry.type === "rule") {
            const ruleElem = makeRule(entry.rule.text);
            ruleElem.style.width = `calc(100% - ${indent + 1.4}rem)`;
            ruleElem.style.marginLeft = `${0.2 + indent}rem`;
            ruleElem.oncontextmenu = (e) => {
                showMenu(e.clientX, e.clientY, entry.rule);
                e.preventDefault();
            }
            rulesList.appendChild(ruleElem);
        }
    });
}
tagsSearch.oninput = () => state.setTagSearchText(tagsSearch.value.trim().toLowerCase());
rulesSearch.oninput = () => state.setSearchText(rulesSearch.value.trim().toLowerCase());

async function loadPage() {
    const rules = await loadRules();
    state = new State(rules, displayUI); 

    const params = new URL(window.location.href).searchParams;
    const id = params.get("id");
    if (id !== null) {
        state.setSearchText(id);
        rulesSearch.value = id;
        if (state.filteredRules.length > 0) {
            setTagsShown(state.filteredRules[0], state);
        }
    }
}

loadPage();

document.addEventListener("click", () => {
    menuDiv.style.opacity = "0";
    setTimeout(() => menuDiv.style.visibility = "hidden", 101);
});