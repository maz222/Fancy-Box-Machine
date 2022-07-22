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
    suggestLabel(userInput, isCaseSensitive=false) {
        var labels = this.getLabelNodes(userInput, isCaseSensitive);
        console.log(labels);
        if(labels.length == 0) {
            return null;
        }
        var maxSuggestion = labels[0].suggestionWeight;
        var suggestedNode = 0;
        for(var i=1; i<labels.length; i++) {
            if(labels[i].suggestionWeight >= maxSuggestion) {
                maxSuggestion = labels[i].suggestionWeight;
                suggestedNode = i;
            }
        }
        return labels[suggestedNode].suggestion;
    }
    getLabelNodes(labelName, isCaseSensitive=false) {
        console.log(labelName);
        function walk(labelName, node, results, isCaseSensitive=false) {
            if(labelName.length == 0 || node === null) {
                if(node !== null) {
                    results.push(node);
                }
                return;
            }
            const currChar = labelName[0];
            var foundNodes = [];
            if(isCaseSensitive) {
                foundNodes.push(node.getChild(currChar));
            }
            else {
                foundNodes.push(node.getChild(currChar.toUpperCase()));
                foundNodes.push(node.getChild(currChar.toLowerCase()));
            }
            for(var i in foundNodes) {
                walk(labelName.slice(1),foundNodes[i],results,isCaseSensitive);
            }
        }
        var walker = this.head;
        var results = [];
        walk(labelName, walker, results, isCaseSensitive);
        return(results);
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