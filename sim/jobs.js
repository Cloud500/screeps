//log -50
module.exports = function() {
    var miner = require('./job_miner');
    var transporter = require('./job_transporter');
    var upgrader = require('./job_upgrader');
    var builder = require('./job_builder');
    
    for(var name_miner in Memory.workers.miner) {
        miner(name_miner);
    }
    for(var name_transporter in Memory.workers.transporter) {
        transporter(name_transporter);
    }
    for(var name_upgrader in Memory.workers.upgrader) {
        upgrader(name_upgrader);
    }
    for(var name_builder in Memory.workers.builder) {
        builder(name_builder);
    }

    log(-50, ['Überprüfe Creep Lebenszeit']);
    for(var name_creep in Memory.creeps) {
        var memory = Memory.creeps[name_creep];
        var creep = Game.creeps[name_creep];
        var job = memory.job;
        var name_room = creep.room.name;
        var parts = [];
        log(-50, ['memory', ots(memory)]);
        log(-50, ['creep', ots(creep)]);
        log(-50, ['job', ots(job)]);
        log(-50, ['name_room', ots(name_room)]);

        switch (job) {
            case JOB_MINER:
                parts = PARTS_MINER;
                break;
            case JOB_TRANSPORTER:
                parts = PARTS_TRANSPORTER;
                break;
            case JOB_UPGRADER:
                parts = PARTS_UPGRADER;
                break;
            case JOB_BUILDER:
                parts = PARTS_BUILDER;
                break;
        }
        log(-50, ['parts', ots(parts)]);

        if(creep.ticksToLive < calc_spawn_time(name_room, parts)) {
            if(memory.replacement == false) {
                log(-50, ['Creeper läuft ab, Order neuen']);
                log(1, ['Creep ', creep.name, 'hat noch ', creep.ticksToLive, ' Ticks zu leben, neuer wird geordert']);
                memory.replacement = create(name_room, job, calc_spawn_tier(name_room, parts), 0);
            }
        }
    }
    
};