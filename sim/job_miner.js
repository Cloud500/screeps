//log -51
var move = require('move');
module.exports = function(name) {
    
    log(-51,['Miner ', name, ' ablauf']);
    var miner = Memory.creeps[name];
    var creep = Game.creeps[name];
    log(-51,['Miner ', ots(miner)]);
    log(-51,['Creep ', ots(creep)]);

    if(creep) {
        if(creep.spawning == false) {
            if(miner.target == false) {
                miner.target = set_target(creep.room.name);
                log(-51,['Target gesetzt: ', miner.target]);
            }
            else {
                log(-51,['Entfernung zum Target: ', creep.pos.getRangeTo(gobi(miner.target).pos)]);
                if(creep.pos.getRangeTo(gobi(miner.target).pos) > 1) {
                    log(-51,['Creep bewegt sich zum Target', miner.target]);
                    //creep.moveTo(gobi(miner.target).pos);
                    move.goTo(creep ,gobi(miner.target))
                } else {
                    log(-51,['Creep Harvestet das Target', miner.target]);
                    creep.harvest(gobi(miner.target));
                }
            }
        }
        if(calc_spawn_time(miner.room, PARTS_MINER) + 10 >= creep.ticksToLive) {
            if(miner.replacementOrder == false) {
                console.log('Miner ' + name + ' Stirbt bald');
                miner.replacementOrder = create(miner.room, JOB_MINER, calc_spawn_tier(miner.room, PARTS_MINER), 0)
                log(-51,['Miner ersatz Order: ', miner.replacementOrder]);
            }
        }
    }
};

function set_target(room_name) {
    //Suche nur im eigenen Raum (überregionale Miner werden Manuell gesetzt
    log(-51,'Suche neues Target');
    var sources = Memory.rooms[room_name].sources;
    log(-51,['Sources im Raum: ',ots(sources)]);

    for(var id in sources) {
        var source = sources[id];
        log(-51,['Prüfe Source: ',ots(source)]);
        //Prüfen ob schon alle plätze besetzt und/oder ob GateKeeper gefahr besteht
        if(check_source_free_space(source) && check_source_keeper_lair(source)) {
            log(-51,['Source ist frei und sicher']);
            return id;
        }
    }
    log(-51,['Keine Sources gefunden']);
    return false;
}

function check_source_free_space(source) {
    log(-51,'Überprüfe ob die Source noch freie Plätze hat');
    var count = 0;
    var creeps = Memory.creeps;
    log(-51,['Creeps ', ots(creeps)]);

    for(var name in creeps) {
        var creep = creeps[name];
        log(-51,['Creep ', ots(creep)]);
        if(creep.job == JOB_MINER && creep.target == source.id) {
            log(-51,'Creep arbeitet an dieser Source');
            count++;
        }
    }
    log(-51,['Source hat ', source.spots, ' Plätze, von denen ', count, ' besetzt sind']);
    if(count < source.spots) {
        return true;
    }
    else {
        return false;
    }
}

function check_source_keeper_lair(source) {
    log(-51,'Überprüfe ob die Source sicher ist');
    log(-51,['Lair ', source.lair]);
    log(-51,['Protected ', source.protected]);

    if(source.lair == false || source.protected == true) {
        return true;
    }
    else {
        return false;
    }
    
}