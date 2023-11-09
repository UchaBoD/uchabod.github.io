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

    const indentAmt = 2;
    flattenedRules.forEach(rule => {
        if (rule.type === "rule") {
            const ruleContainer = document.createElement("div");
            ruleContainer.className = "ruleContainer";
            ruleContainer.style.marginLeft = `${indentAmt*rule.indent}rem`;
            ruleContainer.style.width = `calc(100vw - ${indentAmt*rule.indent}rem)`;

            const numIndex = rule.rule.text.indexOf(". ");
            const number = rule.rule.text.substring(0, numIndex);
            const text = rule.rule.text.substring(numIndex+2);

            const ruleNumber = document.createElement("pre");
            ruleNumber.innerText = `${number}. `;
            ruleNumber.className = "ruleNumber";

            const ruleElem = document.createElement("pre");
            ruleElem.innerText = text;
            ruleElem.className = "rule";

            ruleContainer.appendChild(ruleNumber);
            ruleContainer.appendChild(ruleElem);
            document.body.appendChild(ruleContainer);
        } else if (rule.type === "tag") {
            const tagElem = document.createElement("div");
            tagElem.innerText = rule.name;
            tagElem.style.marginLeft = `${indentAmt*rule.indent}rem`;
            tagElem.className = rule.indent === 0 ? "section" : "tag";

            document.body.appendChild(tagElem);
        }
    })
}

loadPage();