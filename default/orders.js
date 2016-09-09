//log -30


module.exports = function() {
    log(-30, ['Starte Order Management']);
    for(var name_room in Memory.rooms) {

        var miners = {};
        var transporters = {};
        var upgraders = {};
        var builders = {};

        var order_miner = {};
        var order_transporter = {};
        var order_upgrader = {};
        var order_builder = {};

        var count_miner = 0;
        var count_transporter = 0;
        var count_upgrader = 0;
        var count_builder = 0;

        var count_source_spots = 0;

        log(-30, ['Erstelle Liste der Miner']);
        log(-30, ['Memory.workers.miner ', ots(Memory.workers.miner)]);
        miners = add(name_room, Memory.workers.miner);

        log(-30, ['Erstelle Liste der Transporter']);
        log(-30, ['Memory.workers.transporter ', ots(Memory.workers.transporter)]);
        transporters = add(name_room, Memory.workers.transporter);

        log(-30, ['Erstelle Liste der Updater']);
        log(-30, ['Memory.workers.upgrader ', ots(Memory.workers.upgrader)]);
        upgraders = add(name_room, Memory.workers.upgrader);

        log(-30, ['Erstelle Liste der Builder']);
        log(-30, ['Memory.workers.builder ', ots(Memory.workers.builder)]);
        builders = add(name_room, Memory.workers.builder);

        log(-30, ['Erstelle Liste der Miner Order']);
        order_miner = order(JOB_MINER, Memory.rooms[name_room].orders.creeps)

        log(-30, ['Erstelle Liste der Transporter Order']);
        order_transporter = order(JOB_TRANSPORTER, Memory.rooms[name_room].orders.creeps)

        log(-30, ['Erstelle Liste der Upgrader Order']);
        order_upgrader = order(JOB_UPGRADER, Memory.rooms[name_room].orders.creeps)

        log(-30, ['Erstelle Liste der Builder Order']);
        order_builder = order(JOB_BUILDER, Memory.rooms[name_room].orders.creeps)
        

        log(-30, ['Erstelle Summen']);
        count_miner = count(miners) + count(order_miner.free) + count(order_miner.planned);
        count_transporter = count(transporters) + count(order_transporter.free) + count(order_transporter.planned);
        count_upgrader = count(upgraders) + count(order_upgrader.free) + count(order_upgrader.planned);
        count_builder = count(builders) + count(order_builder.free) + count(order_builder.planned);

        log(-30, ['Erstelle Summe der Souce Spots']);
        for(var energy_source in Memory.rooms[name_room].sources) {
            var source = Memory.rooms[name_room].sources[energy_source]
            if(source.lair == false || source.protected == true) {
                count_source_spots = count_source_spots + source.spots;
            }
        }

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
            del_planned_orders(order_miner.planned)
            del_planned_orders(order_transporter.planned)
            del_planned_orders(order_upgrader.planned)

            log(-30, ['Erstelle die Notfallorders']);
            create(name_room, JOB_MINER,0,0);
            create(name_room, JOB_TRANSPORTER,0,0);
            create(name_room, JOB_MINER,0,0);
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

        if(count_transporter < (count_miner + count_upgrader)/3 ) {
            log(-30, ['Order Transporter da die Quote nicht passt']);
            create(name_room, JOB_TRANSPORTER, calc_spawn_tier(name_room, PARTS_MINER), 2);
            return;
        }

        if(count_miner < count_source_spots) {
            log(-30, ['Order Miner da nicht alle Spots belegt']);
            create(name_room, JOB_MINER, calc_spawn_tier(name_room, PARTS_TRANSPORTER), 2);
            return;
        }

        if(count_upgrader > 0 && count_upgrader < Memory.rooms[name_room].controller.level * 2) {
            create(name_room, JOB_UPGRADER, calc_spawn_tier(name_room, PARTS_UPGRADER), 2);
            return;
        }
        
        if(count_builder > 0 && count_builder < Memory.rooms[name_room].controller.level) {
            log(-30, ['Order Upgrader da nicht vorhanden']);
            create(name_room, JOB_BUILDER , calc_spawn_tier(name_room, PARTS_BUILDER), 3);
            return;
        }
    }
};



function add(name_room, source) {
    var target = {};
    for(var name in source) {
        log(-30, ['target ', ots(source[name])]);
        if(name_room == source[name].room) {
            target[source[name].name] = source[name];
        }
    }
    return target;
}

function count(dict) {
    log(-30, ['Zähle']);
    log(-30, ['dict ', ots(dict)]);
    log(-30, ['Object.keys(dict).length ', ots(Object.keys(dict).length)]);
    return Object.keys(dict).length;
}

function order(job, source) {
    var order = {};
    order.free = {};
    order.planned = {};
    for(var id in source) {
        log(-30, ['id ', ots(id)]);
        var memory = source[id];
        log(-30, ['Order memory ', ots(memory)]);
        if (memory.job == job && memory.prod == false) {
            log(-30, ['Order memory Past']);
            if (memory.planned == false) {
                log(-30, ['Order memory Free']);
                order.free[id] = memory;
            }
            else {
                log(-30, ['Order memory Planned']);
                order.planned[id] = memory;
            }

        }
    }
    log(-30, ['order ', ots(order)]);
    return order;
}

function del_free_orders(name_room) {
    for(var id_order in Memory.rooms[name_room].orders.creeps) {
        var memory = Memory.rooms[name_room].orders.creeps[id_order];
        log(-30, ['memory', ots(memory)]);
        if(memory.planned == false && memory.priority > 0) {
            log(-30, ['Lösche die Order aus dem Memory']);
            delete Memory.rooms[name_room].orders.creeps[id_order];
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
            delete Memory.rooms[name_room].orders.creeps[memory_spawn.order];
            memory_spawn.prod = false;
            memory_spawn.order = false;
        }
    }
}



