export default class LabelTrie {
    constructor() {
        this.head = new TrieNode('*',false,null,Number.NEGATIVE_INFINITY);
    }
    addLabel(labelText,labelWeight) {
        var walker = this.head;
        for(var i=0; i<labelText.length; i++) {
            walker = walker.addChild(labelText[i], labelText, labelWeight);
        }
        walker.updateSuggestion(labelText, labelWeight);
        walker.isEnd = true;
    }
    suggestLabel(userInput) {
        var walker = this.head;
        for(var i=0; i<userInput.length; i++){
            walker = walker.getChild(userInput[i]);
            if(walker === null) {
                return null;
            }
        }
        return walker.suggestion;
    }
    clone() {
        var newTrie = new LabelTrie();
        newTrie.head = this.head.clone();
    }
}

class TrieNode {
    constructor(char, isEnd, suggestion, suggestionWeight) {
        this.value = char;
        this.isEnd = isEnd;
        this.suggestion = suggestion;
        this.suggestionWeight = suggestionWeight;
        this.children = {};
    }
    addChild(labelChar, labelText, labelWeight) {
        this.updateSuggestion(labelText, labelWeight);
        if(!(labelChar in this.children)) {
            this.children[labelChar] = new TrieNode(labelChar, false, labelText, labelWeight);
        }
        return this.children[labelChar];
    }
    getChild(char) {
        if(char in this.children) {
            return this.children[char];
        }
        return null;
    }
    updateSuggestion(suggestion, suggestionWeight) {
        if(suggestionWeight >= this.suggestionWeight) {
            this.suggestion = suggestion;
            this.suggestionWeight = suggestionWeight;
            return true;
        }
        return false;
    }
    /* Recursively clones this node as well as all of its children */
    clone() {
        var childClones = {};
        var childKeys = Object.keys(this.children);
        for(var i=0; i < childKeys.length; i++) {
            childClones[childKeys[i]] = this.children[childKeys[i]].clone();
        }
        var clonedNode = new TrieNode(this.value, this.isEnd, this.suggestion, this.suggestionWeight);
        clonedNode.children = childClones;
        return clonedNode;
    }
}