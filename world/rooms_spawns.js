//log -41
module.exports = function(id) {
    log(-41, ['Spawn Ablauf']);
    var spawn = gobi(id);
    var memory = Memory.spawns[id];
    var orders = Memory.rooms[spawn.room.name].orders.creeps;
    log(-41, ['spawn ', ots(spawn)]);
    log(-41, ['memory ', ots(memory)]);
    log(-41, ['orders ', ots(orders)]);

    if(!spawn.spawning) {
        if(memory.prod == true) {
            log(-41, ['Lösche Order ', memory.order]);
            remove_order(spawn, memory.order);
            memory.prod = false;
            memory.order = false;
        }
        else if(memory.order == false) {
            //TODO Order nach Prioritäten staffeln
            log(-41, ['Suche nach neuer Order']);
            for(var order_id in orders) {
                var order = orders[order_id];
                log(-41, ['order ', ots(order)]);
                if (order.planned == false) {
                    order.planned = true;
                    memory.order = order_id;
                    order.spawner = id;
                    log(-41, ['Order gefunden ', memory.order]);
                    return;
                }
            }
        }
        else {
            var build_order = orders[memory.order];
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
    Memory.statistic.creeps++;
    var id = Memory.statistic.creeps;
    var name = spawn.createCreep(order.parts, order.job + '_' + id, {job: order.job, target: false, typ: false, replacement: false});
    log(-41, ['Baue Creep ', name, ' Job: ', order.job, 'Parts: ', ots(order.parts)]);
    Memory.spawns[spawn.id].prod = true;
    order.prod = true;
}

function remove_order(spawn, order_id) {
    delete Memory.rooms[spawn.room.name].orders.creeps[order_id];
    remove_id(order_id);
}