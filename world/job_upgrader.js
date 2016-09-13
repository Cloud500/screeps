//log -53

var move = require('move');
module.exports = function(name) {

    log(-53,['Upgrader ', name, ' ablauf']);
    var upgrader = Memory.creeps[name];
    var creep = Game.creeps[name];
    log(-53,['Upgrader ', ots(upgrader)]);
    log(-53,['Creep ', ots(creep)]);

    if(creep) {
        if(creep.spawning == false) {
            if(upgrader.target == false) {
                upgrader.target = Memory.rooms[creep.room.name].controler.id;
                log(-53,['Target gesetzt: ', upgrader.target]);
            }
            else {
                log(-53,['Entfernung zum Target: ', creep.pos.getRangeTo(gobi(upgrader.target).pos)]);
                if(creep.pos.getRangeTo(gobi(upgrader.target).pos) > 1 || creep.pos.getRangeTo(gobi(upgrader.target).pos) > 2) {
                    log(-53,['Creep bewegt sich zum Target', upgrader.target]);
                    //creep.moveTo(gobi(upgrader.target).pos);
                    move.goTo(creep, gobi(upgrader.target));
                } else {
                    log(-53,['Creep Upgradet das Target', upgrader.target]);
                    creep.upgradeController(gobi(upgrader.target));
                }
            }
        }
        if(calc_spawn_time(upgrader.room, PARTS_UPGRADER) + 10 >= creep.ticksToLive) {
            if(upgrader.replacementOrder == false) {
                console.log('Upgrader ' + name + ' Stirbt bald');
                upgrader.replacementOrder = create(upgrader.room, JOB_UPGRADER, calc_spawn_tier(upgrader.room, PARTS_UPGRADER), 0)
            }
        }
    }
};