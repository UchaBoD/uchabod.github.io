/**
 * Loads all rules from github ref
 * @returns {Promise<RulesEntry[]>}
 */
async function loadRules() {
    const rulesResponse = await fetch("https://raw.githubusercontent.com/UchaBoD/rulebook/master/rules.json", {cache: "no-cache"});
    const rules = await rulesResponse.json();
    return rules;
}

async function loadPage() {
    const rules = await loadRules();
    const orderedRules = orderRules(rules);
    const flattenedRules = flattenOrder(orderedRules);

    console.log(flattenedRules);
}

loadPage();