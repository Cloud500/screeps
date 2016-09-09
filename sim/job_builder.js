//log -54
module.exports = function(name) {
    log(-54,['Builder ', name, ' ablauf']);
    var builder = Memory.creeps[name];
    var creep = Game.creeps[name];
    log(-54,['Builder ', ots(builder)]);
    log(-54,['Creep ', ots(creep)]);

    if(creep) {
        if (creep.spawning == false) {
            if (builder.target == false) {
                log(-54,['Upgrader hat kein Ziel']);
                if(creep.carry.energy == 0) {
                    //Target hole energie
                    builder.target = find_next_stok(creep.room.name);
                    builder.typ = 'stock';
                    log(-52,4['Target gesetzt ', builder.target]);
                }
                if(creep.carry.energy > 0) {
                    //Target baustelle
                    builder.target = find_next_build_target(creep.room.name);
                    builder.typ = 'construction';
                    //Wenn kein Bauplatz gefunden, schauen ob es sich lohnt weiter energie zu sammeln
                    if(builder.target == false &&creep.carry.energy < creep.carryCapacity) {
                        log(-52,['Kein Bauplatz gefunden, sammle weiter energie']);
                        builder.target = find_next_stok(creep.room.name);
                        builder.typ = 'stock';
                    }
                    log(-52,4['Target gesetzt ', builder.target]);
                }
            }
            else {
                if(!gobi(builder.target)) {
                    log(-54,['Target defekt, resette']);
                    log(1, ['ERROR: Creep Target nicht korrekt Creep: ', creep, ' Target ID: ', builder.target]);
                    builder.target = false;
                }
                else if (creep.pos.getRangeTo(gobi(builder.target).pos) > 1) {
                    log(-54,['Entfernung zum Target: ', creep.pos.getRangeTo(gobi(builder.target).pos)]);
                    log(-54,['Creep bewegt sich zum Target ', builder.target]);
                    creep.moveTo(gobi(builder.target).pos);
                }
                else {
                    if(builder.typ == 'stock') {
                        log(-54,['Creep sammelt Energie vom Target ', builder.target]);
                        gobi(builder.target).transferEnergy(creep);
                        builder.target = false;
                    }
                    if(builder.typ == 'construction') {
                        log(-54,['Creep baut Target ', builder.target]);
                        creep.build(gobi(builder.target));
                        builder.target = false;
                    }
                }
            }
        }
    }
};

function find_next_build_target(room_name, prio) {
    prio = prio || 0;
    var targets = Game.rooms[room_name].find(FIND_CONSTRUCTION_SITES);
    for(i in targets) {
        if(prio == 0 && targets[i].structureType == STRUCTURE_EXTENSION) {
            return targets[i].id;
        }
        if(prio == 1 && targets[i].structureType == STRUCTURE_SPAWN) {
            return targets[i].id;
        }
        if(prio == 2 && targets[i].structureType == STRUCTURE_TOWER) {
            return targets[i].id;
        }
        if(prio == 3 && targets[i].structureType != STRUCTURE_ROAD) {
            return targets[i].id;
        }
        if(prio == 4 && targets[i].structureType == STRUCTURE_ROAD) {
            return targets[i].id;
        }
    }
    if(prio > 4) {
        return false;
    }
    else {
        return find_next_build_target(room_name, prio + 1);
    }
}



//TODO Funktion verbessern und Prioritäten in der auswahl
function find_next_stok(room_name) {
    log(-54,['Suche Lager']);
    //TODO WTF? Das übersichtlicher gestalten
    var stocks = Game.rooms[room_name].find(FIND_STRUCTURES, {
                filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
        structure.energy > structure.energyCapacity/3;}});
    log(-52,['Lager ', ots(stocks)]);
    if(stocks.length > 0) {
        log(-52,['Lager gefunden ', stocks[0].id]);
        return stocks[0].id;
    }
    log(-52,['Kein Lager gefunden']);

    return false;
}