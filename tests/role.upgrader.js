var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.work == 'idle') {
            creep.memory.upgrading = false;
            creep.memory.work = 'move';
        }

        if(creep.memory.upgrading == true && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.say('harvesting');
        }
        if(creep.memory.upgrading == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
            creep.say('upgrading');
        }
        if(creep.memory.upgrading == true) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
        else {
            if(creep.withdraw(Game.getObjectById(creep.memory.home), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.home));
            }
        }
    }
};

module.exports = roleUpgrader;