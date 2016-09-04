/*
 Script From MasterEric
 On Github => https://gist.github.com/MasterEric/a14de1a12a09dfc4fe91
 This module allows you to store memory in energy sources,
 similarly to other objects like spawns and creeps.
 It can even by accessed by the source.memory alias!
 To use this in your code, add this line to the top of main:
 var SourceMemory = require("SourceMemory");
 */


/**Create memory for energy sources.
if(Memory.sources == undefined)
    Memory.sources = { };

Source.prototype.memory = Memory.sources[this.id];
 **/
Object.defineProperty(Source.prototype, 'memory', {
    get: function() {
        if(_.isUndefined(Memory.sources)) {
            Memory.sources = {};
        }
        if(!_.isObject(Memory.sources)) {
            return undefined;
        }
        return Memory.sources[this.id] = Memory.sources[this.id] || {};
    },
    set: function(value) {
        if(_.isUndefined(Memory.sources)) {
            Memory.sources = {};
        }
        if(!_.isObject(Memory.sources)) {
            throw new Error('Could not set source memory');
        }
        Memory.sources[this.id] = value;
    }
});