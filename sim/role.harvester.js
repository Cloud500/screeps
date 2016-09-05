/**
 * creep.memory.home => home spawn
 * creep.memory.source => source Ziel des Creeps
 * creep.memory.target => move Ziel
 * creep.memory.work Defeniert was der Creep grad tut
 * idle => grad erstellt wurden
 * harvest => Sammelt energie von creep.memory.target
 * move_to_source => bewegt sich zu creep.memory.source
 * transfer => leert seine energie zu creep.memory.target
 * move_to_home => bewegt sich zu creep.memory.source
 * **/

function run(creep) {

    switch (creep.memory.work) {
        case 'idle':
            creep.memory.work = 'move_to_source';
            var target = find_source_target(creep);
            creep.memory.target = target;
            creep_move(creep);
            break;
        case 'move_to_source':
            creep_move(creep);
            break;
        case 'move_to_home':
            creep_move(creep);
            break;
        case 'harvest':
            creep_harvest(creep);
            break;
        case 'transfer':
            creep_transfer(creep);
            break;
    }
}

function random_move() {
    return Math.floor(Math.random() * (8 - 1)) + 1;
}

function creep_move(creep) {
    if(creep.memory.work == 'move_to_home'
            && Game.getObjectById(creep.memory.home).energy == Game.getObjectById(creep.memory.home).energyCapacity) {
        creep.say('Idle');
        creep.move(random_move());
    }
    else if(creep.memory.work == 'move_to_home') {
        if(!creep.pos.inRangeTo(Game.getObjectById(creep.memory.target), 1)) {
            creep.moveTo(Game.getObjectById(creep.memory.target));
        }
        else {
            creep.memory.work = 'transfer';
            creep.say('Transfer');
            creep_transfer(creep);
        }
    }
    else if(creep.memory.work == 'move_to_source') {
        if(!creep.pos.inRangeTo(Game.getObjectById(creep.memory.target), 1)) {
            creep.moveTo(Game.getObjectById(creep.memory.target));
        }
        else {
            creep.memory.work = 'harvest';
            creep.say('Harvest');
            creep_harvest(creep);
        }
    }
}


function creep_harvest(creep) {
    if(creep.carry.energy < creep.carryCapacity) {
        creep.harvest(Game.getObjectById(creep.memory.target))
    }
    else {
        var target = find_transfer_target(creep);
        creep.memory.target = target;
        creep.memory.work = 'move_to_home';
        creep.say('Move');
        creep_move(creep);
    }
}

function creep_transfer(creep) {
    if(creep.carry.energy > 0) {
        creep.transfer(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY)
    }
    else {
        var target = find_source_target(creep);
        creep.memory.target = target;
        creep.memory.work = 'move_to_source';
        creep.say('Move');
        creep_move(creep);
    }
}

function find_transfer_target(creep) {
    return creep.memory.home
}

function find_source_target(creep) {
    return creep.memory.source
}

module.exports = function(creep) {
    run(creep);
};