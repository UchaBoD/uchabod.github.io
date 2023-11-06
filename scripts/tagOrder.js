const tagOrder = {
    "Preamble": {
        "A. Powers, Limitations and Availability": {},
        "B. Guidelines": {},
        "C. Meetings": {}
    },
    "I. Entrance and Departure": {
        "A. Admittance": {},
        "B. Deposit": {},
        "C. Contract": {},
        "D. Privacy": {},
        "E. Checkout": {}
    },
    "II. Membership Status": {
        "A. Academic Status": {},
        "B. Expulsion": {},
        "C. Grace Quarter": {}
    },
    "III. Chore Obligations": {
        "A. Chores": {},
        "B. Chore Deficiency": {},
        "Bathroom Clean-up Obligations": {}
    },
    "IV. Fine, Debit, and Credit Procedure": {
        "A. Fine and Credit Procedure": {},
        "B. Authority to Issue Fines, Debits": {},
        "C. Authority to Issue Credits and Credit": {},
        "D. Other Charges": {}
    },
    "V. Financial Policy": {
        "A. Room and Board": {},
        "B. Late Charges and Payment Extensions": {},
        "C. Specific Budget Allocations": {},
        "D. Budget Determination": {},
        "E. Audit Committee": {},
        "F. Other Charges": {}
    }
};

function stripIndex(tag) {
    const parts = tag.split(". ");
    return parts[parts.length - 1];
}

function sortRule(a, b) {
    const regA = a.match(/(^[\d]+)\./);
    const regB = b.match(/(^[\d]+)\./);
    if (regA && regB) return parseInt(regA[1]) - parseInt(regB[1]);
    return a.localeCompare(b);
}

/**
 * @typedef {object} OrderEntry
 * @property {object.<string, OrderEntry>} children
 * @property {RulesEntry[]} rules
 */

/**
 * Orders rules with default order. Removes ordered rules from given rules array.
 * @param {RulesEntry[]} rules 
 * @returns {OrderEntry}
 */
function orderRules(rules) {
    return _orderRules(rules, [], tagOrder);
}

/**
 * Orders rules with the given tags. Removes ordered rules from given rules array.
 * @param {RulesEntry[]} rules 
 * @param {string[]} tags 
 * @param {object.<string, object>} order
 * @returns {OrderEntry}
 */
function _orderRules(rules, tags, order) {
    const children = {};
    for (const key of Object.keys(order)) {
        const child = _orderRules(rules, [...tags, key], order[key]);
        if (child.rules.length === 0 && Object.keys(child.children).length === 0) continue;
        children[key] = child;
    }

    const matching = [];
    for (let i = rules.length-1; i >= 0; i--) {
        if (tags.every(tag => rules[i].tags.includes(stripIndex(tag)))) {
            matching.push(rules.splice(i, 1)[0]);
        }
    }
    matching.sort((a, b) => sortRule(a.text, b.text));

    return {
        children: children,
        rules: matching
    };
}

/**
 * Flattens given order into an array of tags and rules.
 * @param {OrderEntry} order 
 */
function flattenOrder(order, indent) {
    if (indent === undefined) indent = 0;

    const flattened = [];
    flattened.push(...order.rules.map(rule => ({
        type: "rule",
        rule: rule,
        indent: indent
    })));
    
    for (const key of Object.keys(order.children)) {
        flattened.push({
            type: "tag",
            name: key,
            indent: indent
        });
        flattened.push(...flattenOrder(order.children[key], indent+1))
    }

    return flattened;
}

