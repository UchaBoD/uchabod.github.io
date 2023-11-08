function randIntInRange(low, high) {
    return Math.floor(Math.random() * (high - low)) + low;
}

/**
 * @typedef {object} RulesEntry
 * @property {string} text
 * @property {string[]} tags
 * @property {number} id
 */

/**
 * @typedef {object} TagEntry
 * @property {string} name
 * @property {number} count
 */

class Rules {
    /**
     * @param {RulesEntry[]} rulesJSON 
     */
    constructor(rulesJSON) {
        this.rules = rulesJSON;
    }

    /**
     * @returns {TagEntry[]}
     */
    get tags() {
        const tagsDict = {};
        this.rules.forEach(rule => rule.tags.forEach(tagName => {
            if (tagName in tagsDict) {
                tagsDict[tagName].count++;
            } else {
                tagsDict[tagName] = {name: tagName, count: 1};
            }
        }));
        const tags = Object.values(tagsDict);
        tags.sort((t1, t2) => (t2.count - t1.count) || (t1.name.localeCompare(t2.name)));
        return tags;
    }

    /**
     * Returns rules which have any of the given tags.
     * @param {TagEntry[]} tags 
     * @param {string} searchText
     * @returns {RulesEntry[]}
     */
    filteredRules(tags, searchText) {
        const tagNames = tags.map(tag => tag.name);
        return this.rules.filter(rule => {
            const tagMatch = tagNames.every(tagName => rule.tags.includes(tagName));
            const textMatch = searchText.length === 0 || rule.text.toLowerCase().includes(searchText);
            const idMatch = rule.id.toString() === searchText;
            return tagMatch && (textMatch || idMatch);
        });
    }

    /**
     * Add a rule with the given text.
     * If a rule with that text already exists, does nothing.
     * @param {string} text 
     * @param {TagEntry[]} tags 
     */
    addRule(text, tags) {
        const uniqueTags = new Set(tags.map(tag => tag.name));   // tags should already be unique, but this is a saftey check
        const takenIDs = new Set(this.rules.filter(rule => rule.id !== undefined).map(rule => rule.id));
        let id = randIntInRange(10000, 100000);
        while (takenIDs.has(id)) id = randIntInRange(10000, 100000);
        this.rules.push({
            text: text,
            tags: Array.from(uniqueTags),
            id: id
        });
    }

    /**
     * Updates the given rule with new text and tags.
     * Does nothing if the given rule cannot be found.
     * @param {number} oldRuleID 
     * @param {string} newText 
     * @param {TagEntry[]} newTags 
     */
    updateRule(oldRuleID, newText, newTags) {
        const rule = this.rules.find(rule => rule.id === oldRuleID);
        if (rule === undefined) return;

        rule.text = newText;
        const uniqueTags = new Set(newTags.map(tag => tag.name));   // tags should already be unique, but this is a saftey check
        rule.tags = Array.from(uniqueTags);
    }

    /**
     * Convert rules to JSON text.
     * @returns {string}
     */
    toJSON() {
        return JSON.stringify(this.rules, null, 4);
    }
}

class State {
    /**
     * Constructs new State object given rules and displayUI callback.
     * @param {RulesEntry[]} rulesJSON 
     * @param {function(State):void} displayUI 
     */
    constructor(rulesJSON, displayUI) {
        this.rules = new Rules(rulesJSON);
        this.unusedTags = [...this.rules.tags];
        this.usedTags = [];
        this.filteredRules = [];
        this.searchText = "";
        this.tagFilterText = "";
        this.displayUI = displayUI;
        this.#filterRules();
        this.displayUI(this);
    }

    /**
     * Swaps the given tag between used and unused.
     * Does nothing if the given tag does not exist.
     * @param {TagEntry} tag 
     */
    swapTag(tag) {
        const unusedIndex = this.unusedTags.indexOf(tag);
        if (unusedIndex !== -1) {
            this.unusedTags.splice(unusedIndex, 1);
            this.usedTags.push(tag);
            this.#filterRules();
            this.displayUI(this);
            return;
        }

        const usedIndex = this.usedTags.indexOf(tag);
        if (usedIndex !== -1) {
            this.usedTags.splice(usedIndex, 1);
            this.unusedTags.push(tag);
            this.#sortUnused();
            this.#filterRules();
            this.displayUI(this);
            return;
        }
    }

    /**
     * Adds the given tag to the used tags list.
     * Does nothing if the given tag already exists.
     * @param {TagEntry} tag 
     */
    addUsedTag(tag) {
        if (this.getTag(tag.name) !== undefined) return;
        this.usedTags.push(tag);
        this.#filterRules();
        this.displayUI(this);
    }

    /**
     * Removes the given tag from whereever it lives.
     * Does nothing if the given tag does not exist.
     * @param {TagEntry} tag 
     */
    removeTag(tag) {
        const unusedIndex = this.unusedTags.indexOf(tag);
        if (unusedIndex !== -1) {
            this.unusedTags.splice(unusedIndex, 1);
            this.displayUI(this);
            return;
        }

        const usedIndex = this.usedTags.indexOf(tag);
        if (usedIndex !== -1) {
            this.usedTags.splice(usedIndex, 1);
            this.#filterRules();
            this.displayUI(this);
            return;
        }
    }

    /**
     * Gets the tag object for the given tag name.
     * Returns undefined if it can't be found/
     * @param {string} tagName 
     */
    getTag(tagName) {
        return this.unusedTags.find(tag => tag.name === tagName) || this.usedTags.find(tag => tag.name === tagName);
    }

    /**
     * Sets the search text to filter the rules by.
     * @param {string} text 
     */
    setSearchText(text) {
        this.searchText = text;
        this.#filterRules();
        this.displayUI(this);
    }

    /**
     * Sets the search text to filter the tags by.
     * @param {string} text 
     */
    setTagSearchText(text) {
        this.tagFilterText = text;
        this.displayUI(this);
    }

    /**
     * Resets all tags to unused.
     */
    resetTags() {
        this.unusedTags = [...this.rules.tags];
        this.usedTags = [];
        this.tagFilterText = "";
        this.#filterRules();
        this.displayUI(this);
    }

    #filterRules() {
        this.filteredRules = this.rules.filteredRules(this.usedTags, this.searchText);
    }

    #sortUnused() {
        this.unusedTags.sort((t1, t2) => (t2.count - t1.count) || (t1.name.localeCompare(t2.name)));
    }
}