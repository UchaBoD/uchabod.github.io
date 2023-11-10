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
    },
    "VI. Room Occupancy": {
        "A. Jurisdiction": {},
        "B. Filling Rooms": {},
        "C. Seniority": {},
        "D. Tenure": {},
        "E. Room Bump Procedures": {},
        "F. Summer Tenure": {},
        "G. Room Cheating": {},
        "H. Disability Accommodations": {}
    },
    "VII. Parking": {
        "A. Jurisdiction": {},
        "B. Parking Rules": {}  
    },
    "VIII. Dining": {
        "A. Meal Guest Privileges": {}
    },
    "IX. Room and Facilities Regulations": {
        "A. Room Regulations": {},
        "B. Room Guests": {},
        "C. Dining": {},
        "D. Common Areas and Common Rooms": {},
        "E. Roofs": {},
        "F. Facilities": {},
        "G. Smoking": {},
        "H. Mailroom": {},
        "I. Atrium": {}
    },
    "X. General Regulations": {
        "A. Notices": {},
        "B. House Meetings": {},
        "C. Quiet Hours": {},
        "D. Pets": {},
        "E. Uncooperative Behavior": {},
        "F. Negligence": {},
        "G. Complaint Procedure": {},
        "H. Intellectual Property": {},
        "I. Miscellaneous": {},
        "J. Disability Accommodations Verification": {}
    },
    "XI. Security": {
        "A. Outsiders": {},
        "B. PNG": {}
    },
    "XII. Elections": {
        "A. Jurisdiction": {},
        "B. Calling of Elections": {},
        "C. Nominations": {},
        "D. Polling": {},
        "E. Counting the Ballots": {},
        "F. Valid Ballots": {}
    },
    "XIII. MemCom": {
        "A. Jurisdiction": {},
        "B. Composition": {},
        "C. Arbitration": {},
        "D. MemCom Assignments": {},
        "E. Procedures": {},
        "F. Fine and Uncooperative Chore Shift Appeals": {},
        "G. House Meetings": {},
        "H. Chairperson Assignments": {}
    },
    "XIV. BoD": {
        "A. Composition": {},
        "B. Rules": {},
        "C. Officer and Committee Assignments": {},
        "D. Board of Directors Directives": {},
        "E. Appeals to the BoD of MemCom Decisions": {},
        "F. Appeals to the BoD of BoD Decisions": {}
    },
    "VX. Initiative Process": {
        "A. Scope": {},
        "B. Submission of a petition": {},
        "C. Requirements for the signatures": {},
        "D. Meeting of the Association": {},
        "E. Polling": {},
        "F. Ballots": {},
        "G. Result of Initiative": {}
    },
    "XVI. UCHA Committees": {
        "A. Purpose of UCHA Committees": {},
        "B. Types of UCHA Committees": {},
        "C. UCHA Committee Charters": {},
        "D. UCHA Committee Chairs": {},
        "E. UCHA Committee Members": {},
        "F. Fiduciary Obligations of UCHA Committee Members": {}
    }
};

function stripIndex(tag) {
    const parts = tag.split(". ");
    return parts[parts.length - 1];
}

const allCollapsed = () => Object.fromEntries(Object.keys(tagOrder).map(tag => [stripIndex(tag), {}]));

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
 * @param {object.<string, object>} collapsedTags
 * @returns {OrderEntry}
 */
function orderRules(rules, collapsedTags) {
    return _orderRules(rules, tagOrder, collapsedTags || {});
}

/**
 * Orders rules based on given order. Removes ordered rules from given rules array.
 * @param {RulesEntry[]} rules 
 * @param {object.<string, object>} order
 * @param {object.<string, object>} collapsedTags
 * @returns {OrderEntry}
 */
function _orderRules(rules, order, collapsedTags) {
    const ruleBins = {};
    for (const tag in order) {
        ruleBins[stripIndex(tag)] = {title: tag, rules: []};
    }

    let done = false;
    let j = 0;  // sort based on tag position, first tag having highest priority
    while (!done) { // repeat until all tags of each rule have been checked
        done = true;
        for (let i = rules.length-1; i >= 0; i--) {
            const rule = rules[i];
            if (j >= rule.tags.length) continue;    // skip if no tags remain for this rule
            done = false;
            const tag = rule.tags[j];
            if (ruleBins[tag] === undefined) continue; // skip if this tag doesn't have a bin
            ruleBins[tag].rules.push(rules.splice(i, 1)[0]);
        }
        j++;
    }

    const children = {};
    for (const tag in ruleBins) {
        const bin = ruleBins[tag];
        const child = _orderRules(bin.rules, order[bin.title], collapsedTags[tag] || {});
        if (child.rules.length === 0 && Object.keys(child.children).length === 0) continue;

        const shouldCollapse = collapsedTags[tag] !== undefined && Object.keys(collapsedTags[tag]).length === 0;
        if (shouldCollapse) {
            children[bin.title] = {
                children: {},
                rules: []
            };
        } else {
            children[bin.title] = child;
        }
    }

    rules.sort((a, b) => sortRule(a.text, b.text));

    return {
        children: children,
        rules: rules
    };
}

/**
 * @typedef {object} FlattenedEntry
 * @property {("rule"|"tag")} type
 * @property {RulesEntry} rule
 * @property {string} name
 * @property {string[]} path
 * @property {number} indent
 */

/**
 * Flattens given order into an array of tags and rules.
 * @param {OrderEntry} order 
 * @param {string[]} path
 * @returns {FlattenedEntry[]}
 */
function flattenOrder(order, path) {
    if (path === undefined) path = [];

    const flattened = [];
    flattened.push(...order.rules.map(rule => ({
        type: "rule",
        rule: rule,
        indent: path.length
    })));
    
    for (const key of Object.keys(order.children)) {
        flattened.push({
            type: "tag",
            name: key,
            indent: path.length,
            path: [...path, stripIndex(key)]
        });
        flattened.push(...flattenOrder(order.children[key], [...path, stripIndex(key)]))
    }

    return flattened;
}

