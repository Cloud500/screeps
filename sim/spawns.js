//log -41
module.exports = function(id_spawn) {
    log(-41, ['Spawn Ablauf']);
    var spawn = gobi(id_spawn);
    var memory_spawn = Memory.spawns[id_spawn];
    var memory_orders = Memory.rooms[memory_spawn.pos.roomName].orders;

    log(-41, ['spawn ', ots(spawn)]);
    log(-41, ['memory_spawn ', ots(memory_spawn)]);
    log(-41, ['memory_orders ', ots(memory_orders)]);

    if(!spawn.spawning) {
        if(memory_spawn.prod == true) {
            log(-41, ['Lösche Order ', memory_spawn.order]);
            remove_order(spawn, memory_spawn.order);
            memory_spawn.prod = false;
            memory_spawn.order = false;
        }
        else if(memory_spawn.order == false) {
            memory_spawn.order = find_order(id_spawn, memory_orders, 0);
        }
        else {
            var build_order = memory_orders[memory_spawn.order];
            log(-41, ['Baukontrolle für Order ', ots(build_order)]);
            switch (spawn.canCreateCreep(build_order.parts)) {
                case 0:
                    prod_order(spawn, build_order);
                    break;
                case -1: //ERR_NOT_OWNER
                    log(-41, ['ERR_NOT_OWNER']);
                    break;
                case -3: //ERR_NAME_EXISTS
                    log(-41, ['ERR_NAME_EXISTS']);
                    break;
                case -4: //ERR_BUSY
                    log(-41, ['ERR_BUSY']);
                    break;
                case -6: //ERR_NOT_ENOUGH_ENERGY
                    //TODO Energiekosten angeben
                    log(-41, ['ERR_NOT_ENOUGH_ENERGY']);
                    break;
                case -10: //ERR_INVALID_ARGS
                    log(-41, ['ERR_INVALID_ARGS']);
                    break;
                case -14: //ERR_RCL_NOT_ENOUGH
                    log(-41, ['ERR_RCL_NOT_ENOUGH']);
                    break;
                default:
                    log(-41, ['Ich hab kein Plan was nicht Passt ...']);
                    break;
            }
        }
    }
    else {
        log(-41, ['Baue bereits']);
    }
};

function prod_order(spawn, order) {
    var name_room = spawn.room.name;
    Memory.empire.creeps++;
    var number = Memory.empire.creeps;
    var name = order.job + '_' + number;
    spawn.createCreep(order.parts, name, {room: name_room, name: name, job: order.job, target: false, targetTyp: false, replacementOrder: false, squad: false});
    log(-41, ['Baue Creep ', name, ' Job: ', order.job, 'Parts: ', ots(order.parts)]);
    Memory.spawns[spawn.id].prod = true;
    order.prod = true;

    //TODO Alle Jobs Hinzufügen
    switch(order.job) {
        case JOB_MINER:
            Memory.rooms[name_room].worker.miner.push(name);
            break;
        case JOB_UPGRADER:
            Memory.rooms[name_room].worker.upgrader.push(name);
            break;
        case JOB_TRANSPORTER:
            Memory.rooms[name_room].worker.transporter.push(name);
            break;
        case JOB_BUILDER:
            Memory.rooms[name_room].worker.builder.push(name);
            break;
        case JOB_ENGINEER:
            Memory.rooms[name_room].worker.engineer.push(name);
    }
}

function remove_order(spawn, order_id) {
    delete Memory.rooms[spawn.room.name].orders[order_id];
    remove_id(order_id);
}

function count(dict) {
    log(-30, ['Zähle']);
    log(-30, ['dict ', ots(dict)]);
    log(-30, ['Object.keys(dict).length ', ots(Object.keys(dict).length)]);
    return Object.keys(dict).length;
}

function find_order(id_spawn, memory_orders, prio) {
    if(count(memory_orders) < 1) {
        log(-41, ['Keine Order vorhanden']);
        return false;
    }
    

    log(-41, ['Suche nach neuer Order mit Prio: ', prio]);
    for(var order_id in memory_orders) {
        var order = memory_orders[order_id];
        log(-41, ['order ', ots(order)]);
        if (order.planned == false && order.priority == prio) {
            order.planned = true;
            order.spawner = id_spawn;
            log(-41, ['Order gefunden ', order_id]);
            return order_id;
        }
    }
    if(prio >= 5) {
        log(-41, ['Keine Order gefunden']);
     return false;
    }
    log(-41, ['Keine Order gefunden, erhöhe Prio auf ', prio +1]);
    return find_order(id_spawn, memory_orders, prio + 1);
}