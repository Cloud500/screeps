//log -30


module.exports = function(name_room) {
    log(-30, ['Starte Order Management']);
    //TODO Alle Jobs Hinzufügen
    var miners = Memory.rooms[name_room].worker.miner;
    var transporters = Memory.rooms[name_room].worker.transporter;
    var upgraders = Memory.rooms[name_room].worker.upgrader;
    var builders = Memory.rooms[name_room].worker.builder;

    var order_list = {};

    var count_miner = 0;
    var count_transporter = 0;
    var count_upgrader = 0;
    var count_builder = 0;

    var count_source_spots = 0;


    log(-30, ['Erstelle Liste der Order']);
    order_list = order(Memory.rooms[name_room].orders);


    log(-30, ['Erstelle Summen']);
    count_miner = count(miners) + order_list.miner.count;
    count_transporter = count(transporters) + order_list.transporter.count;
    count_upgrader = count(upgraders) + order_list.upgrader.count;
    count_builder = count(builders) + order_list.builder.count;

    log(-30, ['Erstelle Summe der Souce Spots']);
    count_source_spots = Memory.rooms[name_room].sourceSpotsSave;

    log(-30, ['count_miner ', count_miner]);
    log(-30, ['count_transporter ', count_transporter]);
    log(-30, ['count_upgrader ', count_upgrader]);
    log(-30, ['count_builder ', count_builder]);
    log(-30, ['count_source_spots ', count_source_spots]);

    //Start & Fallback wenn keine Miner und Transporter mehr da sind
    if(count_miner == 0 && count_transporter == 0) {
        log(-30, ['Failback Gestartet']);

        log(-30, ['Lösche alle nicht zugeordnete Orders']);
        del_free_orders(name_room);

        log(-30, ['Lösche alle zugeordnete aber nicht in Produktion befindlichen Order']);
        del_planned_orders(order_list.miner.planned)
        del_planned_orders(order_list.transporter.planned)
        del_planned_orders(order_list.upgrader.planned)
        del_planned_orders(order_list.builder.planned)

        log(-30, ['Erstelle die Notfallorders']);
        create(name_room, JOB_MINER,0,0);
        create(name_room, JOB_TRANSPORTER,0,0);
        create(name_room, JOB_MINER,0,0);
        create(name_room, JOB_TRANSPORTER,0,0);
        return;
    }

    //Schaue was so gebaut werden kann
    if(count_upgrader == 0) {
        log(-30, ['Order Upgrader da nicht vorhanden']);
        create(name_room, JOB_UPGRADER,0,1);
        return;
    }

    if(count_builder == 0 && count_transporter > 2) {
        log(-30, ['Order Upgrader da nicht vorhanden']);
        create(name_room, JOB_BUILDER,0,1);
        return;
    }

    if((count_transporter < (count_miner + count_upgrader)/3) || (count_upgrader >= count_transporter) ) {
        log(-30, ['Order Transporter da die Quote nicht passt']);
        create(name_room, JOB_TRANSPORTER, calc_spawn_tier(name_room, PARTS_MINER), 2);
        return;
    }

    if(count_miner < count_source_spots) {
        log(-30, ['Order Miner da nicht alle Spots belegt']);
        create(name_room, JOB_MINER, calc_spawn_tier(name_room, PARTS_TRANSPORTER), 2);
        return;
    }

    if(count_upgrader > 0 && count_upgrader < Memory.rooms[name_room].controler.level * 2) {
        create(name_room, JOB_UPGRADER, calc_spawn_tier(name_room, PARTS_UPGRADER), 2);
        return;
    }

    if(count_builder > 0 && count_builder < Memory.rooms[name_room].controler.level) {
        log(-30, ['Order Upgrader da nicht vorhanden']);
        create(name_room, JOB_BUILDER , calc_spawn_tier(name_room, PARTS_BUILDER), 3);
        return;
    }
};


function count(dict) {
    log(-30, ['Zähle']);
    log(-30, ['dict ', ots(dict)]);
    log(-30, ['Object.keys(dict).length ', ots(Object.keys(dict).length)]);
    return Object.keys(dict).length;
}
function order(source) {

    //TODO Alle Jobs Hinzufügen
    var order = {};
    order.miner = {};
    order.transporter = {};
    order.upgrader = {};
    order.builder = {};

    order.miner.count = 0;
    order.transporter.count = 0;
    order.upgrader.count = 0;
    order.builder.count = 0;

    order.miner.free = {};
    order.transporter.free = {};
    order.upgrader.free = {};
    order.builder.free = {};

    order.miner.planned = {};
    order.transporter.planned = {};
    order.upgrader.planned = {};
    order.builder.planned = {};


    for(var id in source) {
        log(-30, ['id ', ots(id)]);
        var memory = source[id];
        log(-30, ['Order memory ', ots(memory)]);

        if (memory.job == JOB_MINER && memory.prod == false) {
            if (memory.planned == false) {
                log(-30, ['Order memory Free']);
                order.miner.free[id] = memory;
            }
            else {
                log(-30, ['Order memory Planned']);
                order.miner.planned[id] = memory;
            }
            order.miner.count++;
        }
        if (memory.job == JOB_TRANSPORTER && memory.prod == false) {
            if (memory.planned == false) {
                log(-30, ['Order memory Free']);
                order.transporter.free[id] = memory;
            }
            else {
                log(-30, ['Order memory Planned']);
                order.transporter.planned[id] = memory;
            }
            order.transporter.count++;
        }
        if (memory.job == JOB_UPGRADER && memory.prod == false) {
            if (memory.planned == false) {
                log(-30, ['Order memory Free']);
                order.upgrader.free[id] = memory;
            }
            else {
                log(-30, ['Order memory Planned']);
                order.upgrader.planned[id] = memory;
            }
            order.upgrader.count++;
        }
        if (memory.job == JOB_BUILDER && memory.prod == false) {
            if (memory.planned == false) {
                log(-30, ['Order memory Free']);
                order.builder.free[id] = memory;
            }
            else {
                log(-30, ['Order memory Planned']);
                order.builder.planned[id] = memory;
            }
            order.builder.count++;
        }
    }
    log(-30, ['order ', ots(order)]);
    return order;
}

function del_free_orders(name_room) {
    for(var id_order in Memory.rooms[name_room].orders) {
        var memory = Memory.rooms[name_room].orders[id_order];
        log(-30, ['memory', ots(memory)]);
        if(memory.planned == false && memory.priority > 0) {
            log(-30, ['Lösche die Order aus dem Memory']);
            delete Memory.rooms[name_room].orders[id_order];
        }
    }
}

function del_planned_orders(planned_order) {
    for(var id in planned_order) {
        var memory_order = planned_order[id];
        var memory_spawn = Memory.spawns[memory_order.spawner];
        var spawn = gobi(memory_spawn.id);
        log(-30, ['memory_order ', ots(memory_order)]);
        log(-30, ['memory_spawn ', ots(memory_spawn)]);
        log(-30, ['spawn ', ots(spawn)]);

        if(!spawn.spawning){
            log(-30, ['Lösche die Order aus dem Memory und aus dem Spawn']);
            delete Memory.rooms[memory_spawn.pos.roomName].orders[memory_spawn.order];
            memory_spawn.prod = false;
            memory_spawn.order = false;
        }
    }
}



