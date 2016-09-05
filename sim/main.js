/**
 * Eigenen Move schreiben...
 * Ziel merken um andere für anweisungen gleich wo anders hin zu schicken ( vor move alle Spawns ziel = meins? dann anderes)
 *
 * straßen bevorzugen also auch mal einen rechts oder so um eine straße zu nutzen
 *
 * Schauen ob da wo ich lang gehe nen creep steht, wenn ja dann ausweichen
 *
 */


//console.log(JSON.stringify(<myVariable>))

var SourceMemory = require("SourceMemory");
var spawner = require('role.spawn');
var harvesters = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    
    for(var name in Game.spawns) {
        var spawn = Game.spawns[name];
        spawner(spawn);
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];

        if(creep.memory.role == 'harvester') {
            harvesters(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }
};