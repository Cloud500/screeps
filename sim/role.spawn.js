
function spawn_role_harvest(spawn, role, source) {
    var newName = spawn.createCreep([WORK,CARRY,MOVE], undefined,
            {role: role, work: 'idle', target: undefined, source: source, home: spawn.id});
    console.log('Spawning new Screep: ' + newName + ' with Role: ' + role);
}

function spawn_role_upgrader(spawn, role) {
    var newName = spawn.createCreep([WORK,CARRY,MOVE], undefined,
        {role: role, work: 'idle', target: undefined, home: spawn.id});
    console.log('Spawning new Screep: ' + newName + ' with Role: ' + role);
}

function spawn_role_builder(spawn, role) {
    var newName = spawn.createCreep([WORK,CARRY,MOVE], undefined,
        {role: role, work: 'idle', target: undefined, home: spawn.id});
    console.log('Spawning new Screep: ' + newName + ' with Role: ' + role);
}

function get_sources(spawn) {
    return spawn.room.find(FIND_SOURCES);
}

function set_source_count(spawn) {
    var sources = get_sources(spawn);
    for(var i in sources) {
        var source = sources[i];
        source.memory.harvestMax = 5;
    }
}

function get_creep_count(source_id) {
    var count = 0;
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            if(creep.memory.source == source_id.id) {
                count += 1;
            }
        }
    return count;
}

function change_min_max_pos(pos) {
    if(pos < 0) {
        return 0;
    }
    else if(pos > 49) {
        return 49;
    }
    else {
        return pos;
    }
}

function is_source_danger(source) {
    var x = source.pos.x;
    var y = source.pos.y;
    var x_i = 0;
    var x_min = change_min_max_pos(x - 10);
    var x_max = change_min_max_pos(x + 10);
    var y_i = 0;
    var y_min = change_min_max_pos(y - 10);
    var y_max = change_min_max_pos(y + 10);

    for(x_i = x_min; x_i < x_max; x_i++) {
        for(y_i = y_min; y_i < y_max; y_i++) {
            var look = source.room.lookAt(x_i, y_i);
            
            look.forEach(function(lookObject) {
                if(lookObject.type == LOOK_CREEPS && lookObject[LOOK_CREEPS].owner.username != 'Cloud500') {
                    return true;
                }
            });

            look.forEach(function(lookObject) {
                if(lookObject.type == LOOK_STRUCTURES && lookObject[LOOK_STRUCTURES].structureType == STRUCTURE_KEEPER_LAIR) {
                    return true;
                }
            });
        }
    }
    return false;
}

function get_free_source(spawn) {
    var sources = get_sources(spawn);
    for(var i in sources) {
        var source = sources[i];
        var danger = is_source_danger(source);
        if(get_creep_count(source) < source.memory.harvestMax && danger == false) {
         return source.id;
        }
    }
}

function run(spawn) {
    set_source_count(spawn);

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var upgrader = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var builder = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');

    /** Abhängig vom controler Lv machen**/
    if(spawn.energy >= 200) {
        var source_id = get_free_source(spawn);

        if(upgrader.length < Math.floor(harvesters.length / 4)){
            spawn_role_upgrader(spawn, 'upgrader');
        }
        else if(builder.length < Math.floor(harvesters.length / 4)) {
            spawn_role_builder(spawn, 'builder');
        }
        else if(source_id) {
            spawn_role_harvest(spawn, 'harvester', source_id);
        }
    }
}

module.exports = function(spawn) {
    run(spawn);
};