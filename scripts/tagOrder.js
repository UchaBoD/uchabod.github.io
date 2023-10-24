const tagOrder = {
    "Preamble": {
        "Powers, Limitations and Availability": {},
        "Guidelines": {},
        "Meetings": {}
    },
    "Entrance and Departure": {
        "Admittance": {},
        "Deposit": {},
        "Contract": {},
        "Privacy": {},
        "Checkout": {}
    },
    "Membership Status": {
        "Academic Status": {},
        "Expulsion": {}
    }
};

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
        if (tags.every(tag => rules[i].tags.includes(tag))) {
            matching.push(rules.splice(i, 1)[0]);
        }
    }

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
    for (const key of Object.keys(order.children)) {
        flattened.push({
            type: "tag",
            name: key,
            indent: indent
        });
        flattened.push(...flattenOrder(order.children[key], indent+1))
    }

    flattened.push(...order.rules.map(rule => ({
        type: "rule",
        rule: rule,
        indent: indent
    })));

    return flattened;
}

