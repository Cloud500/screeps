//log -2

/**
 * Generell bekommen Creeper im Memory:
 * job => den job für den sie erstellt wurden
 * target => das aktuelle ziel; false wenn idle => mal string mal objekt aber immer min die ID
 * transporter ham noch den Transportyp (energie oder reessourcen)
 *
 */

//TODO clean_sources und upgrade_sources hinzufügen
//TODO beim Upgraden der sources bezüglich protected planen

/**
 *
 * @returns {{check_memory: check_memory, gobi: Function, add_creep_count: add_creep_count, build_structure: build_structure, clean_structure: clean_structure, upgrade_structure: upgrade_structure, get_new_id: get_new_id, remove_id: remove_id, log: log, ots: ots}}
 */
module.exports = function() {
    var check_memory = function() {
        if (!String.prototype.includes) {
            String.prototype.includes = function() {
                'use strict';
                return String.prototype.indexOf.apply(this, arguments) !== -1;
            };
        }

        if(!Memory.statistic) {
            Memory.statistic = {};
        }

        if(!Memory.statistic.creeps) {
            Memory.statistic.creeps = 0;
        }

        if(!Memory.rooms) {
            Memory.rooms = {};
        }
        if(!Memory.spawns) {
            Memory.spawns = {};
        }

        if(!Memory.cities) {
            Memory.cities = {};
        }
        if(!Memory.outposts) {
            Memory.outposts = {};
        }
        //TODO Alle Jobs hinzufügen
        if(!Memory.workers) {
            Memory.workers = {};
        }
        if(!Memory.workers.miner) {
            Memory.workers.miner = {};
        }
        if(!Memory.workers.transporter) {
            Memory.workers.transporter = {};
        }
        if(!Memory.workers.upgrader) {
            Memory.workers.upgrader = {};
        }
        if(!Memory.workers.builder) {
            Memory.workers.builder = {};
        }


        if (!Memory.squads) {
            Memory.squads = {};
        }
        if(!Memory.ids){
            Memory.ids = [];
        }
        //TODO Diplomatie einfügen
        if (!Memory.diplomacy) {
            Memory.diplomacy = {};
        }
        if (!Memory.diplomacy.neutral) {
            Memory.diplomacy.neutral = {};
        }
        if (!Memory.diplomacy.alliances) {
            Memory.diplomacy.alliances = {};
        }
        if (!Memory.diplomacy.enemies) {
            Memory.diplomacy.enemies = {};
        }
    };

    function add_creep_count(){
        return Memory.lastId++;
    }

    function build_structure() {
        add_rooms();
        add_creeps();
        add_spawns();
        add_sources();
        add_drops_energy();
    }

    function clean_structure() {
        clean_rooms();
        clean_creeps();
        clean_spawns();
        clean_drops_energy();
    }

    function upgrade_structure() {
        upgrade_controller();
        upgrade_creeps();
        upgrade_drops_energy();
    }

    function get_new_id() {
        var id_neu = make_id();

        for(var id in Memory.ids) {
            if(Memory.ids[id] == id_neu) {
                return get_new_id()
            }
        }
        Memory.ids[Memory.ids.length] = id_neu;
        return id_neu
    }

    function remove_id(id) {
        for(var i in Memory.ids) {
            if(Memory.ids[i] == id) {
                delete Memory.ids[i];
            }
        }
    }

    function log(deep, array) {
        if (deep <= logging && deep > 0 && logging > 0) {
            log_write(array);
            return;
        }
        else {
            if (deep == logging && deep < 0 && logging < 0) {
                log_write(array);
                return;
            }
        }
    }
    function log_write(array) {
        var string = '';
        for(var i in array) {
            string = string + array[i];
        }
        console.log(string);
    }

    function ots(obj) {
        return JSON.stringify(obj);
    }

    function create(room_name, code, tier, prio) {
        prio = prio || 0;
        var order = calc_order(code, tier, prio);
        if(!order) {
            //nix Order
            return false;
        }
        else {
            var id = get_new_id()
            Memory.rooms[room_name].orders.creeps[id] = order;
            return id;
        }
    }

    function calc_spawn_tier(name_room, parts) {
        var max_energy = Game.rooms[name_room].energyCapacityAvailable;
        var base_energy = 0;
        log(-2,['max_energy: ', max_energy]);
        for(var id in parts) {
            for(var name in BODYPART_COST) {
                if(name == parts[id]) {
                    base_energy = base_energy + BODYPART_COST[name];
                }
            }
        }
        log(-2,['base_energy: ', base_energy]);
        var tier = Math.floor(max_energy / base_energy);
        log(-2,['Tier: ', tier]);
        return tier;
    }

    function calc_spawn_time(name_room, parts) {
        var tier = calc_spawn_tier(name_room, parts);
        var tier_parts = add_body(tier, parts);

        if(tier_parts.length) {
            return tier_parts.length * 3
        }
        else {
            return 150;
        }
    }

    function cpu_mon(){
        var tail = 16;
        Memory.CPU = Memory.CPU || [];
        Memory.CPU[Game.time%tail] = Game.cpu.getUsed(),"of",Game.cpuLimit;
            var avgCPU = 0;
            for(var k in Memory.CPU) {avgCPU=avgCPU+Memory.CPU[k]; };
            avgCPU = Math.round(avgCPU/Memory.CPU.length*100)/100;
            var stdevCPU = 0;
            for(var k in Memory.CPU) {stdevCPU=stdevCPU+(Memory.CPU[k]-avgCPU)*(Memory.CPU[k]-avgCPU); };
            stdevCPU=Math.round(Math.sqrt(stdevCPU)/tail*100)/100;
            log(2, ["CPU: ", avgCPU," +/- ", stdevCPU]);
    };

    return {
        'check_memory': check_memory,
        'gobi': Game.getObjectById,
        'add_creep_count': add_creep_count,
        'build_structure': build_structure,
        'clean_structure': clean_structure,
        'upgrade_structure': upgrade_structure,
        'get_new_id': get_new_id,
        'remove_id': remove_id,
        'log': log,
        'ots': ots,
        'create': create,
        'calc_spawn_tier': calc_spawn_tier,
        'calc_spawn_time': calc_spawn_time,
        'cpu_mon': cpu_mon,
    };
}();

//TODO Alle Jobs hinzufügen
function add_creeps() {
    for(var name in Game.creeps) {
        if(!Memory.creeps[name]) {
            Memory.creeps[name] = {};
        }
        if(Memory.creeps[name].job == JOB_MINER) {
            if (!Memory.workers.miner[name]){
                Memory.workers.miner[name] = Memory.creeps[name];
            }
        }
        if(Memory.creeps[name].job == JOB_TRANSPORTER) {
            if (!Memory.workers.transporter[name]){
                Memory.workers.transporter[name] = Memory.creeps[name];
            }
        }
        if(Memory.creeps[name].job == JOB_UPGRADER) {
            if (!Memory.workers.upgrader[name]){
                Memory.workers.upgrader[name] = Memory.creeps[name];
            }
        }
        if(Memory.creeps[name].job == JOB_BUILDER) {
            if (!Memory.workers.builder[name]){
                Memory.workers.builder[name] = Memory.creeps[name];
            }
        }
    }
}

//TODO Alle Jobs hinzufügen
function clean_creeps() {
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            if(Memory.workers.miner[name]) {
                delete Memory.workers.miner[name];
            }
            if(Memory.workers.transporter[name]) {
                delete Memory.workers.transporter[name];
            }
            if(Memory.workers.upgrader[name]) {
                delete Memory.workers.upgrader[name];
            }
            if(Memory.workers.builder[name]) {
                delete Memory.workers.builder[name];
            }
        }
    }
}

//TODO Alle Jobs hinzufügen
function upgrade_creeps() {
    for(var name in Memory.creeps) {
        Memory.creeps[name].id = Game.creeps[name].id;
        Memory.creeps[name].name = name;
        Memory.creeps[name].room = Game.creeps[name].room.name;
    }

    for(var name_miner in Memory.workers.miner) {
        if(Memory.creeps[name_miner]) {
            Memory.workers.miner[name_miner] = Memory.creeps[name_miner];
        }
    }
    for(var name_transporter in Memory.workers.transporter) {
        if (Memory.creeps[name_transporter]) {
            Memory.workers.transporter[name_transporter] = Memory.creeps[name_transporter];
        }
    }
    for(var name_upgrader in Memory.workers.upgrader) {
        if(Memory.creeps[name_upgrader]) {
            Memory.workers.upgrader[name_upgrader] = Memory.creeps[name_upgrader];
        }
    }
    for(var name_builder in Memory.workers.builder) {
        if(Memory.creeps[name_builder]) {
            Memory.workers.builder[name_builder] = Memory.creeps[name_builder];
        }
    }
}

function add_rooms() {
    for(var name in Game.rooms) {
        if(!Memory.rooms[name]) {
            Memory.rooms[name] = {};
        }
        if(!Memory.rooms[name].orders) {
            Memory.rooms[name].orders = {};
        }
        if(!Memory.rooms[name].orders.creeps) {
            Memory.rooms[name].orders.creeps = {};
        }
        if(!Memory.rooms[name].controller) {
            Memory.rooms[name].controller = {};
        }
    }
}

function clean_rooms() {
    for(var name in Memory.rooms) {
        if(!Game.rooms[name]) {
            delete Memory.rooms[name];
        }
    }
}


function upgrade_controller() {
    for(var name in Game.rooms) {
        var controller = Game.rooms[name].controller;
        Memory.rooms[name].controller.id = controller.id;
        Memory.rooms[name].controller.level = controller.level;
        Memory.rooms[name].controller.ticksToDowngrade = controller.ticksToDowngrade;
    }
}





function add_spawns() {
    for(var name in Game.spawns) {
        var id = Game.spawns[name].id;
        if(!Memory.spawns[id]) {
            Memory.spawns[id] = {};
        }
        if(!Memory.spawns[id].id) {
            Memory.spawns[id].id = id;
        }
        if(!Memory.spawns[id].name) {
            Memory.spawns[id].name = name;
        }
        if(!Memory.spawns[id].order) {
            Memory.spawns[id].order = false;
        }
        if(!Memory.spawns[id].prod) {
            Memory.spawns[id].prod = false;
        }
        

    }
}

function clean_spawns() {
    for(var id in Memory.spawns) {
        for(var name in Game.spawns) {
            if(!Game.spawns[name].id == id) {
                delete Memory.spawns[id];
            }
        }
    }
}

function add_drops_energy() {
    for(var room_name in Memory.rooms) {
        if(!Memory.rooms[room_name].drops) {
            Memory.rooms[room_name].drops = {};
        }
        if(!Memory.rooms[room_name].drops.energy) {
            Memory.rooms[room_name].drops.energy = {};
        }
        if(!Memory.rooms[room_name].drops.resources) {
            Memory.rooms[room_name].drops.resources = {};
        }

        var all_energy = Game.rooms[room_name].find(FIND_DROPPED_ENERGY);
        
        for(var i in all_energy) {
            if(!Memory.rooms[room_name].drops.energy[all_energy[i].id]) {
                Memory.rooms[room_name].drops.energy[all_energy[i].id] = all_energy[i];
            }
        }
    }
}

function clean_drops_energy() {
    for(var room_name in Memory.rooms) {

        for(var drop in Memory.rooms[room_name].drops.energy) {

            var exist = gobi(drop);
            if(!exist) {
                delete Memory.rooms[room_name].drops.energy[drop];
            }
        }
    }
}

function upgrade_drops_energy() {
    for(var room_name in Memory.rooms) {
        for(var drop in Memory.rooms[room_name].drops.energy) {
            Memory.rooms[room_name].drops.energy[drop] = gobi(drop);
        }
    }
}

function add_sources() {
    for(var name in Memory.rooms) {
        if(!Memory.rooms[name].sources){
            var sources = {};
            //Alle Ressoucen auflisten
            var all_sources = Game.rooms[name].find(FIND_SOURCES);

            for(var i in all_sources){
                var source = {};

                source.id = all_sources[i].id;

                //Suche nach Keeper Lair's
                if(all_sources[i].pos.findInRange(FIND_STRUCTURES, 5, {
                        filter: {
                            structureType: STRUCTURE_KEEPER_LAIR
                        }
                    }).length > 0) {
                    source.lair = true;
                    source.protected = false;
                }
                else{
                    source.lair = false;
                    source.protected = false;
                }

                //Position der Ressource
                source.pos = all_sources[i].pos;

                //Anzahl der plätze zum abbauen
                source.spots = 0;
                for(var dx=-1;dx<=1;dx++){
                    for(var dy=-1;dy<=1;dy++){
                        var look = Game.rooms[name].lookAt(source.pos.x+dx,source.pos.y+dy,source.pos.roomName);
                        var string = "";
                        source.spots++;
                        look.forEach(function(lookObject){
                            string = string + lookObject.type + (lookObject.terrain||"") + " ";
                            if(lookObject.type == 'terrain' && lookObject.terrain == 'wall'){
                                source.spots--;
                            }
                        });
                    }
                }
                sources[all_sources[i].id] = source;
            }
            Memory.rooms[name].sources = sources;
        }
    }
}

function make_id()
{
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 25; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


//TODO Alle Jobs hinzufügen
function calc_order(code, tier, prio) {
    var order = {};
    order.priority = prio;
    order.planned = false;
    order.spawner = false;
    order.prod = false;
    order.replacement = false;
    
    if(code == JOB_MINER) {
        order.job = code;
        if(tier == 0) {
            order.parts = [MOVE, WORK];
        }
        else if(tier > 0 && tier < 11) {
            order.parts = add_body(tier, PARTS_MINER);
        }
        else {
            return undefined
        }
    }
    if(code == JOB_TRANSPORTER) {
        order.job = code;
        if(tier == 0) {
            order.parts = [MOVE, CARRY];
        }
        else if(tier > 0 && tier < 11) {
            order.parts = add_body(tier, PARTS_TRANSPORTER);
        }
        else {
            return undefined
        }
    }
    if(code == JOB_UPGRADER) {
        order.job = code;
        if(tier == 0) {
            order.parts = [MOVE, CARRY, WORK];
        }
        else if(tier > 0 && tier < 11) {
            order.parts = add_body(tier, PARTS_UPGRADER);
        }
        else {
            return undefined
        }
    }
    if(code == JOB_BUILDER) {
        order.job = code;
        if(tier == 0) {
            order.parts = [MOVE, CARRY, WORK];
        }
        else if(tier > 0 && tier < 11) {
            order.parts = add_body(tier, PARTS_BUILDER);
        }
        else {
            return undefined
        }
    }

    log(1, [order.job, ' LV', tier, ' wird geordert']);
    return order;
}

function add_body(count, parts) {
    var sum = parts;

    for (i = 1; i < count; i++) {
        sum = sum.concat(parts);
    }
    return sum;
}