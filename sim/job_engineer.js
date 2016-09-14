//log -55
var move = require('move');

module.exports = function(name) {
    log(-55,['Engineer ', name, ' ablauf']);
    var engineer = Memory.creeps[name];
    var creep = Game.creeps[name];
    log(-55,['engineer ', ots(engineer)]);
    log(-55,['Creep ', ots(creep)]);

    if(creep) {
        if (creep.spawning == false) {
            if (engineer.target == false) {
                log(-55,['Engineer hat kein Ziel']);
                if(creep.carry.energy == 0) {
                    //Target hole energie
                    engineer.target = find_next_stok(creep.room.name);
                    engineer.typ = 'stock';
                    log(-55,['Target gesetzt ', engineer.target]);
                }
                if(creep.carry.energy > 0) {
                    //Target defekte Konstruktion
                    engineer.target = find_next_engineertarget(creep.room.name);
                    engineer.typ = 'engineering';
                    //Wenn keine defekte Konstruktion gefunden, schauen ob es sich lohnt weiter energie zu sammeln
                    if(engineer.target == false &&creep.carry.energy < creep.carryCapacity) {
                        log(-55,['Kein Bauplatz gefunden, sammle weiter energie']);
                        engineer.target = find_next_stok(creep.room.name);
                        engineer.typ = 'stock';
                    }
                    log(-55,['Target gesetzt ', engineer.target]);
                }
            }
            else {
                if(!gobi(engineer.target)) {
                    log(-55,['Target defekt, resette']);
                    log(1, ['ERROR: Creep Target nicht korrekt Creep: ', creep, ' Target ID: ', engineer.target]);
                    engineer.target = false;
                }
                else if (creep.pos.getRangeTo(gobi(engineer.target).pos) > 2) {
                    log(-55,['Entfernung zum Target: ', creep.pos.getRangeTo(gobi(engineer.target).pos)]);
                    log(-55,['Creep bewegt sich zum Target ', engineer.target]);
                    //creep.moveTo(gobi(engineer.target).pos);
                    move.goTo(creep, gobi(engineer.target));
                }
                else {
                    if(engineer.typ == 'stock') {
                        log(-55,['Creep sammelt Energie vom Target ', engineer.target]);
                        gobi(engineer.target).transferEnergy(creep);
                        engineer.target = false;
                    }
                    if(engineer.typ == 'engineering') {
                        log(-55,['Creep repariert Target ', engineer.target]);
                        creep.repair(gobi(engineer.target));
                        engineer.target = false;
                    }
                }
            }
        }
        if(calc_spawn_time(engineer.room, PARTS_ENGINEER) + 10 >= creep.ticksToLive) {
            if(engineer.replacementOrder == false) {
                console.log('Engineer ' + name + ' Stirbt bald');
                engineer.replacementOrder = create(engineer.room, JOB_ENGINEER, calc_spawn_tier(engineer.room, PARTS_ENGINEER), 0)
            }
        }
    }
};

function find_next_engineertarget(room_name, prio) {
    prio = prio || 0;
    var targets = Game.rooms[room_name].find(FIND_STRUCTURES, { filter: function(struct) {
        if(struct.hits < ((struct.hitsMax / 4) * 3)) {
            return struct;
        }
    }});
    
    for(i in targets) {
        if(prio == 0 && targets[i].structureType == STRUCTURE_SPAWN) {
            return targets[i].id;
        }
        if(prio == 0 && targets[i].structureType == STRUCTURE_EXTENSION) {
            return targets[i].id;
        }
        if(prio == 2 && targets[i].structureType == STRUCTURE_TOWER) {
            return targets[i].id;
        }
        if(prio == 3 && targets[i].structureType != STRUCTURE_ROAD && targets[i].structureType != STRUCTURE_WALL) {
            return targets[i].id;
        }
        if(prio == 4 && targets[i].structureType == STRUCTURE_WALL) {
            return targets[i].id;
        }
        if(prio == 5 && targets[i].structureType == STRUCTURE_ROAD) {
            return targets[i].id;
        }
    }
    if(prio > 5) {
        return false;
    }
    else {
        return find_next_engineertarget(room_name, prio + 1);
    }
}



//TODO Funktion verbessern und Prioritäten in der auswahl
function find_next_stok(room_name) {
    log(-55,['Suche Lager']);
    //TODO WTF? Das übersichtlicher gestalten
    var stocks = Game.rooms[room_name].find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                structure.energy > structure.energyCapacity/3;}});
    log(-55,['Lager ', ots(stocks)]);
    if(stocks.length > 0) {
        log(-55,['Lager gefunden ', stocks[0].id]);
        return stocks[0].id;
    }
    log(-55,['Kein Lager gefunden']);

    return false;
}