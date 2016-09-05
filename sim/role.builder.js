var roleBuilder = {

    run: function(creep) {

        if(creep.memory.work == 'idle') {
            creep.memory.build = false;
            creep.memory.work = 'move';
        }

        if(creep.memory.build == true && creep.carry.energy == 0) {
            creep.memory.build = false;
            creep.say('harvesting');
        }
        if(creep.memory.build == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.build = true;
            creep.say('upgrading');
        }
        if(creep.memory.build == true) {
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }
        }
        else {
            if(creep.withdraw(Game.getObjectById(creep.memory.home), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.home));
            }
        }
    }
};

module.exports = roleBuilder;