
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
        source.memory.harvestMax = 3;
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

function get_free_source(spawn) {
    var sources = get_sources(spawn);
    for(var i in sources) {
        var source = sources[i];
        if(get_creep_count(source) < source.memory.harvestMax) {
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
        else if(builder.length < Math.floor(harvesters.length / 4) && spawn.room.find(FIND_CONSTRUCTION_SITES)).length > 0 {
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