global.logging = 1;
global.JOB_MINER = 'miner';
global.PARTS_MINER = [MOVE, MOVE, WORK, WORK];
global.JOB_TRANSPORTER = 'transporter';
global.PARTS_TRANSPORTER = [MOVE, MOVE, CARRY, CARRY, CARRY];
global.JOB_UPGRADER = 'upgrader';
global.PARTS_UPGRADER = [MOVE, CARRY, WORK, WORK];
global.JOB_BUILDER = 'builder';
global.PARTS_BUILDER = [MOVE, MOVE, CARRY, CARRY, WORK];
global.JOB_ENGINEER = 'engineer';
global.PARTS_ENGINEER = [MOVE, MOVE, CARRY, CARRY, WORK, WORK];




var helper = require('helper');
global.log = helper.log;
global.ots = helper.ots;
global.gobi = helper.gobi;
global.create = helper.create;
global.get_new_id = helper.get_new_id;
global.remove_id = helper.remove_id;
global.calc_spawn_time = helper.calc_spawn_time;
global.calc_spawn_tier = helper.calc_spawn_tier;
global.calc_spawn_costs = helper.calc_spawn_costs;
global.scanRoom = helper.scanRoom;


var orderRun = require('orders');
var spawnRun = require('spawns');
var minerRun = require('job_miner');
var transporterRun = require('job_transporter');
var upgraderRun = require('job_upgrader');
var builderRun = require('job_builder');
var engineerRun = require('job_engineer');
module.exports.loop = function () {
    //return;
    
    PathFinder.use(true);
    helper.firstRun();

    if(Game.getLength(Game.rooms) != Memory.roomCount) {
        console.log('Führe Roomscanner aus');
        for(let name_room in Game.rooms) {
            helper.scanRoom(name_room);
        }
    }

    if(Game.getLength(Game.spawns) != Memory.empire.spawns) {
        console.log('Führe Spawnscanner aus');
        for(let name_spawns in Game.spawns) {
            helper.scanSpawns(Game.spawns[name_spawns].id);
        }
    }

    for(let i in Memory.empire.citys) {
        var name_room = Memory.empire.citys[i];
        var memory_room = Memory.rooms[name_room];

        orderRun(name_room);

        for(let i in memory_room.spawns) {
            //Versuche Order zu Produzieren
            spawnRun(memory_room.spawns[i]);
        }

        //Find Scan Drops
        helper.scanDrops(Memory.empire.citys[i]);

        if(Memory.empire.creeps > 0) {
            for(let i in memory_room.worker.transporter) {
                transporterRun(memory_room.worker.transporter[i]);
            }

            for(let i in memory_room.worker.miner) {

                minerRun(memory_room.worker.miner[i]);
            }

            if(ticksToWork(2) == true){
                for(let i in memory_room.worker.upgrader) {
                    upgraderRun(memory_room.worker.upgrader[i]);
                }
            }

            if(ticksToWork(2) == false){
                for(let i in memory_room.worker.builder) {
                    builderRun(memory_room.worker.builder[i]);
                }
                for(let i in memory_room.worker.engineer) {
                    engineerRun(memory_room.worker.engineer[i])
                }
            }
            
        }
        Memory.rooms[name_room].controler.level = Game.rooms[name_room].controller.level
    }


    //Tote Creeps löschen
    for(let name_creep in Memory.creeps) {

        if(!Game.creeps[name_creep]) {
            console.log('Toter Creep');

            //TODO Alle Jobs hinzufügen
            if(Memory.creeps[name_creep].job == JOB_MINER) {
                let index = Memory.rooms[Memory.creeps[name_creep].room].worker.miner.indexOf(name_creep);
                Memory.rooms[Memory.creeps[name_creep].room].worker.miner.splice(index, 1);
            }

            if(Memory.creeps[name_creep].job == JOB_TRANSPORTER) {
                let index = Memory.rooms[Memory.creeps[name_creep].room].worker.transporter.indexOf(name_creep);
                Memory.rooms[Memory.creeps[name_creep].room].worker.transporter.splice(index, 1);
            }

            if(Memory.creeps[name_creep].job == JOB_UPGRADER) {
                let index = Memory.rooms[Memory.creeps[name_creep].room].worker.upgrader.indexOf(name_creep);
                Memory.rooms[Memory.creeps[name_creep].room].worker.upgrader.splice(index, 1);
            }

            if(Memory.creeps[name_creep].job == JOB_BUILDER) {
                let index = Memory.rooms[Memory.creeps[name_creep].room].worker.builder.indexOf(name_creep);
                Memory.rooms[Memory.creeps[name_creep].room].worker.builder.splice(index, 1);
            }
            if(Memory.creeps[name_creep].job == JOB_ENGINEER) {
                let index = Memory.rooms[Memory.creeps[name_creep].room].worker.engineer.indexOf(name_creep);
                Memory.rooms[Memory.creeps[name_creep].room].worker.engineer.splice(index, 1);
            }

            delete Memory.creeps[name_creep];
        }
    }
};


function ticksToWork(ticks) {
    return Game.time % ticks === 0;
}