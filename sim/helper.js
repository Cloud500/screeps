"use strict"
const helper = {

    firstRun() {
        Game.getLength = function(oTmpObject)
        {
            var iLength = 0;

            for (var sKey in oTmpObject)
            {
                if (oTmpObject.hasOwnProperty(sKey)) iLength++;
            }
            return iLength;
        };

        if (!String.prototype.includes) {
            String.prototype.includes = function() {
                'use strict';
                return String.prototype.indexOf.apply(this, arguments) !== -1;
            };
        }
        if(!Memory.ids){
            Memory.ids = [];
        }


        global.add_sources = add_sources;
    },

    findNearestStructure(creep, structureType) {
        return creep.pos.findClosestByRange(FIND_STRUCTURES,
            {
                filter: function (structure) {
                    return structure.structureType == structureType;
                }
            });
    },
    
    findNearestFullContainer(creep) {
        return creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: function (object) {
                return object.structureType == STRUCTURE_CONTAINER && object.store[RESOURCE_ENERGY] > 0;
            }
        });
    },

    findNearestEmptyContainer(creep) {
        return creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: function (object) {
                return object.structureType == STRUCTURE_CONTAINER && _.sum(object.store) < object.storeCapacity;
            }
        });
    },


    findNearestEmptyStructure(creep, structureType) {
        return creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: function (object) {
                return object.structureType == structureType && _.sum(object.store) < object.storeCapacity;
            }
        });
    },

    findNearestFullStructure(creep, structureType) {
        return creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: function (object) {
                return object.structureType == structureType && object.store[RESOURCE_ENERGY] > 0;
            }
        });
    },

    ots(obj) {
    return JSON.stringify(obj);
    },

    log(deep, array) {
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
    },
    
    gobi(id) {
        return Game.getObjectById(id);
    },

     get_new_id() {
        var id_neu = make_id();

        for(var id in Memory.ids) {
            if(Memory.ids[id] == id_neu) {
                return get_new_id()
            }
        }
        Memory.ids[Memory.ids.length] = id_neu;
        return id_neu
},
    
    remove_id(id) {
        var index = Memory.ids.indexOf(id);
        Memory.ids.splice(index, 1);
    },

    create(room_name, code, tier, prio) {
        prio = prio || 0;
        var order = calc_order(code, tier, prio);
        if(!order) {
            return false;
        }
        else {
            var id = get_new_id()
            Memory.rooms[room_name].orders[id] = order;
            return id;
        }
    },
    
    calc_spawn_costs(parts) {
        var base_energy = 0;
        for(var id in parts) {
            for(var name in BODYPART_COST) {
                if(name == parts[id]) {
                    base_energy = base_energy + BODYPART_COST[name];
                }
            }
        }
        return base_energy;
    },

    calc_spawn_tier(name_room, parts) {
        var max_energy = Game.rooms[name_room].energyCapacityAvailable;
        var base_energy = calc_spawn_costs(parts);
        var tier = Math.floor(max_energy / base_energy);
        return tier;
    },
    
    calc_spawn_time(name_room, parts) {
        var tier = calc_spawn_tier(name_room, parts);
        var tier_parts = add_body(tier, parts);
    
        if(tier_parts.length) {
            return tier_parts.length * 3
        }
        else {
            return 150;
        }
    },


    scanSpawns(id_spawn) {
        if (!Memory.spawns) {
            Memory.spawns = {};
        }
        if(!Memory.empire.spawns) {
            Memory.empire.spawns = 0;
        }
        if(!Memory.spawns[id_spawn]) {
            Memory.spawns[id_spawn] = {};
            Memory.spawns[id_spawn].name = gobi(id_spawn).name;
            Memory.spawns[id_spawn].order = false;
            Memory.spawns[id_spawn].prod = false;
            Memory.spawns[id_spawn].pos = gobi(id_spawn).pos;
            Memory.empire.spawns++;
        }
        if(!Memory.rooms[Memory.spawns[id_spawn].pos.roomName].spawns) {
            Memory.rooms[Memory.spawns[id_spawn].pos.roomName].spawns = [];
        }
        if (Memory.rooms[Memory.spawns[id_spawn].pos.roomName].spawns.indexOf(id_spawn) == -1) {
            Memory.rooms[Memory.spawns[id_spawn].pos.roomName].spawns.push(id_spawn);
        }
        //TODO Wie lösche ich Spawns wenn sie verschwinden
    },
    
    scanDrops(name_room) {
        for(var drop in Memory.rooms[name_room].drops.energy) {
            var exist = gobi(drop);
            if(!exist) {
                delete Memory.rooms[name_room].drops.energy[drop];
            }
            else {
                Memory.rooms[name_room].drops.energy[drop] = gobi(drop);
            }
        }
        add_drops_energy(name_room)
    },

    scanRoom(name_room) {
        if (!Memory.rooms) {
            Memory.rooms = {};
        }
        if(!Memory.roomCount) {
            Memory.roomCount = 0;
        }
        if (!Memory.rooms[name_room]) {
            Memory.rooms[name_room] = {};
            Memory.rooms[name_room].sourceSpots = 0;
            Memory.rooms[name_room].sourceSpotsSave = 0;
            add_sources(name_room);
            add_drops_energy(name_room);
            //TODO Der rest
            Memory.rooms[name_room].orders = {};
            Memory.rooms[name_room].controler = {};
            Memory.rooms[name_room].controler.id = Game.rooms[name_room].controller.id;
            Memory.rooms[name_room].controler.level = Game.rooms[name_room].controller.level;
            Memory.roomCount ++;
        }
        if(!Memory.rooms[name_room].worker) {
            Memory.rooms[name_room].worker = {};
            Memory.rooms[name_room].worker.miner = [];
            Memory.rooms[name_room].worker.upgrader = [];
            Memory.rooms[name_room].worker.transporter = [];
            Memory.rooms[name_room].worker.builder = [];
        }
        
        if (Game.rooms[name_room].controller.my) {
            if (!Memory.empire) {
                Memory.empire = {};
                Memory.empire.citys = [];
                Memory.empire.outposts = [];
                Memory.empire.creeps = 0;
                Memory.empire.spawns = 0;
                Memory.empire.fights = 0;
            }
            if (Memory.empire.citys.indexOf(name_room) == -1) {
                Memory.empire.citys.push(name_room);
            }
        }
        else {
            if (!Memory.empire) {
                Memory.empire = {};
                Memory.empire.citys = [];
                Memory.empire.outposts = [];
                Memory.empire.creeps = 0;
                Memory.empire.fights = 0
            }
            else if (Memory.empire.citys.indexOf(name_room) > -1) {
                var index = Memory.empire.citys.indexOf(name_room);
                Memory.empire.citys.splice(index, 1);
            }
        }
    }
};

function log_write(array) {
    var string = '';
    for(var i in array) {
        string = string + array[i];
    }
    console.log(string);
}

function add_sources(name_room) {
    if(!Memory.rooms[name_room].sources){

        var sources = {};
        //Alle Ressoucen auflisten
        var all_sources = Game.rooms[name_room].find(FIND_SOURCES);

        for(var i in all_sources){
            var source = {};
            source.id = all_sources[i].id;

            //Suche nach Keeper Lair's
            if(all_sources[i].pos.findInRange(FIND_STRUCTURES, 5, {
                    filter: {structureType: STRUCTURE_KEEPER_LAIR}}).length > 0) {
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
                    var look = Game.rooms[name_room].lookAt(source.pos.x+dx,source.pos.y+dy,source.pos.roomName);
                    var string = "";
                    source.spots++;
                    Memory.rooms[name_room].sourceSpots++;

                    if(source.lair==false) {
                        Memory.rooms[name_room].sourceSpotsSave++;
                    }
                    look.forEach(function(lookObject){
                        string = string + lookObject.type + (lookObject.terrain||"") + " ";
                        if(lookObject.type == 'terrain' && lookObject.terrain == 'wall'){
                            source.spots--;
                            Memory.rooms[name_room].sourceSpots--;
                            if(source.lair==false) {
                                Memory.rooms[name_room].sourceSpotsSave--;
                            }
                        }
                    });
                }
            }
            sources[all_sources[i].id] = source;
        }
        Memory.rooms[name_room].sources = sources;
    }
}

//TODO Alle Jobs hinzufügen
function calc_order(code, tier, prio) {
    var order = {};
    order.priority = prio;
    order.planned = false;
    order.spawner = false;
    order.prod = false;

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

    for (let i = 1; i < count; i++) {
        sum = sum.concat(parts);
    }
    return sum;
}

function make_id() {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 25; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


function add_drops_energy(room_name) {
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







module.exports = helper;