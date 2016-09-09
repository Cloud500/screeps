//log -52
module.exports = function(name) {

    log(-52,['Transporter ', name, ' ablauf']);
    var transporter = Memory.creeps[name];
    var creep = Game.creeps[name];
    log(-52,['Transporter ', ots(transporter)]);
    log(-52,['Creep ', ots(creep)]);

    if(creep) {
        if(creep.spawning == false) {
            if(transporter.target == false) {
                log(-52,['Transporter hat kein Ziel']);
                if(creep.carry.energy > 0) {
                    transporter.target = find_next_stok(creep.room.name);
                    transporter.typ = 'stock';
                    //Wenn kein Lager gefunden, schauen ob es sich lohnt weiter energie zu sammeln
                    if(transporter.target == false &&creep.carry.energy < creep.carryCapacity) {
                        log(-52,['Kein Lager gefunden, suche Source']);
                        transporter.target = find_next_collect_target(creep.room.name);
                        transporter.typ = 'source';
                    }
                    log(-52,['Target gesetzt ', transporter.target]);
                }
                if(creep.carry.energy == 0) {
                    transporter.target = find_next_collect_target(creep.room.name);
                    log(-52,['Target gesetzt ', transporter.target]);
                    transporter.typ = 'source';
                }
            }
            else {
                if(!gobi(transporter.target)) {
                    log(-52,['Target defekt, resette']);
                    log(1, ['ERROR: Creep Target nicht korrekt Creep: ', creep, ' Target ID: ', transporter.target]);
                    transporter.target = false;
                }
                else if (creep.pos.getRangeTo(gobi(transporter.target).pos) > 1) {
                    log(-52,['Entfernung zum Target: ', creep.pos.getRangeTo(gobi(transporter.target).pos)]);
                    log(-52,['Creep bewegt sich zum Target ', transporter.target]);
                    creep.moveTo(gobi(transporter.target).pos);
                }
                else{
                    if(transporter.typ == 'stock') {
                        log(-52,['Creep transferiert Energie zum Target ', transporter.target]);
                        creep.transfer(gobi(transporter.target), RESOURCE_ENERGY);
                        transporter.target = false;
                    }
                    if(transporter.typ == 'source') {
                        log(-52,['Creep sammelt Energie vom Target ', transporter.target]);
                        creep.pickup(gobi(transporter.target));
                        transporter.target = false;
                    }
                }
            }
        }
    }
};

function find_next_collect_target(room_name) {
    log(-52,['Suche Source']);
    var energy_drops = Memory.rooms[room_name].drops.energy;
    log(-52,['Energie drops ', ots(energy_drops)]);

    var energy_drop_tmp = {};
    energy_drop_tmp.amount = 0;
    energy_drop_tmp.id = '';
    for(var name_drop in energy_drops) {
        var energy_drop = energy_drops[name_drop];
        log(-52,['Energie drop ', ots(energy_drop)]);
        //TODO Unterschied Energie oder Res. anhand eines memory feldes
        //Suche die nächste freie und größte Energieressource
        //TODO tatsächlich die NÄCHSTE suchen
        if(true == true) {
            //Ressource besetzt?
            var besetzt = false;
            var creeps = Memory.creeps;
            log(-52,['Creeps ', ots(creeps)]);
            for(var name_creep in creeps) {
                var creep = creeps[name_creep];
                log(-52,['Creep ', ots(creep)]);
                if(creep.job == JOB_TRANSPORTER && creep.target == energy_drop.id) {
                    log(-52,['Drop schon besetzt']);
                    besetzt = true;
                }
            }
            if(besetzt == false) {
                //Ressource größer als die letzte?
                if(energy_drop_tmp.amount < energy_drop.amount) {
                    log(-52,['Drop ist größer als vorheriger']);
                    energy_drop_tmp.id = energy_drop.id;
                    energy_drop_tmp.amount = energy_drop.amount;
                }
            }
        }
    }
    if(energy_drop_tmp.amount > 0) {
        log(-52,['Drop gefunden ', energy_drop_tmp.id]);
        return energy_drop_tmp.id
    }
    else {
        log(-52,['Kein drop gefunden']);
        return false;
    }
}

//TODO Funktion verbessern und Prioritäten in der auswahl
function find_next_stok(room_name) {

    log(-52,['Suche Upgrader']);
    //Fülle Upgrader die leerer als 1/3 sind
    for(var name in Memory.workers.upgrader) {
        //var upgrader = Memory.workers.upgrader[name];
        var creep = Game.creeps[name];
        log(-52,['creep ', ots(creep)]);
        if(creep.room.name == room_name && creep.carry.energy < creep.carryCapacity / 3) {
            log(-52,['Upgrader gefunden schaue ob schon verplant', ots(creep.id)]);
            var besetzt = false;
            for(var name_transporter in Memory.workers.transporter) {
                var transporter = Memory.workers.transporter[name_transporter];
                if (transporter.target == creep.id) {
                    log(-52,['Upgrader besetzt ']);
                    besetzt = true;
                }
            }
            if(besetzt == false) {
                log(-52,['Upgrader gefunden ', ots(creep.id)]);
                return creep.id;
            }
        }
    }

    log(-52,['Suche Lager']);
    //TODO WTF? Das übersichtlicher gestalten
    var stocks = Game.rooms[room_name].find(FIND_STRUCTURES, {
                filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
        structure.energy < structure.energyCapacity;}});
    log(-52,['Lager ', ots(stocks)]);
    if(stocks.length > 0) {
        log(-52,['Lager gefunden ', stocks[0].id]);
        return stocks[0].id;
    }
    log(-52,['Kein Lager gefunden']);

    return false;
}