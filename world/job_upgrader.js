//log -53
module.exports = function(name) {

    log(-53,['Upgrader ', name, ' ablauf']);
    var upgrader = Memory.creeps[name];
    var creep = Game.creeps[name];
    log(-53,['Upgrader ', ots(upgrader)]);
    log(-53,['Creep ', ots(creep)]);

    if(creep) {
        if(creep.spawning == false) {
            if(upgrader.target == false) {
                upgrader.target = Memory.rooms[creep.room.name].controller.id;
                log(-53,['Target gesetzt: ', upgrader.target]);
            }
            else {
                log(-53,['Entfernung zum Target: ', creep.pos.getRangeTo(gobi(upgrader.target).pos)]);
                if(creep.pos.getRangeTo(gobi(upgrader.target).pos) > 1) {
                    log(-53,['Creep bewegt sich zum Target', upgrader.target]);
                    creep.moveTo(gobi(upgrader.target).pos);

                } else {
                    log(-53,['Creep Upgradet das Target', upgrader.target]);
                    creep.upgradeController(gobi(upgrader.target));
                }
            }
        }
    }
};