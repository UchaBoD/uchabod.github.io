/**
 * @typedef {object} RulesEntry
 * @property {string} text
 * @property {string[]} tags
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
            return tagMatch && textMatch;
        });
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
        this.displayUI = displayUI;
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
     * Sets the search text to filter the rules by.
     * @param {string} text 
     */
    setSearchText(text) {
        this.searchText = text;
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