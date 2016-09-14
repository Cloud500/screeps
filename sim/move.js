
const move = {
    goTo(creep, dest) {

        if (typeof dest == 'string') {
            dest = gobi(dest)
        }

        if (creep.fatigue > 0) {
            return -1;
        }
        if (typeof dest == "undefined") {
            return -1;
        }

        var locStr = creep.room.name + "." + creep.pos.x + "." + creep.pos.y

        var path = false;

        if (typeof Memory.routeCache !== "object") {
            Memory.routeCache = {};
        }

        if (typeof Memory.routeCache[locStr] === "undefined") {

            Memory.routeCache[locStr] = {'dests': {}, 'established': Game.time}


        }
        if (typeof Memory.routeCache[locStr]['dests']['' + dest.id] === "undefined") {
            Memory.routeCache[locStr]['dests'][dest.id] = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0};
            path = creep.room.findPath(creep.pos, dest.pos, {maxOps: 500, heuristicWeight: 2})
            if (typeof path[0] !== "undefined") {


                Memory.routeCache[locStr]['dests']['' + dest.id][path[0].direction] += 1;

                for (var i = 0; i < path.length - 1; i++) {
                    var step = path[i];
                    var stepStr = creep.room.name + "." + step.x + "." + step.y//creep.room.name+"."+step.x+"."+step.y
                    if (typeof Memory.routeCache[stepStr] === "undefined") {
                        Memory.routeCache[stepStr] = {'dests': {}, 'established': Game.time, 'usefreq': 0.0};
                    }
                    if (typeof Memory.routeCache[stepStr]['dests']['' + dest.id] === "undefined") {
                        Memory.routeCache[stepStr]['dests']['' + dest.id] = {
                            1: 0,
                            2: 0,
                            3: 0,
                            4: 0,
                            5: 0,
                            6: 0,
                            7: 0,
                            8: 0
                        };
                    }
                    //console.log(path[i+1].direction);
                    Memory.routeCache[stepStr]['dests']['' + dest.id][path[i + 1].direction] += 1;

                }
            }
            else {

                dir = Math.floor(Math.random() * 8);


                var error = creep.move(dir);
                return error;

            }
        }

        for (var k in Memory.routeCache[locStr]['dests']) {
            if (Game.getObjectById(k) == null) {//clean out invalid routes
                delete  Memory.routeCache[locStr]['dests'][k];
                //console.log("Pruned",k)
            }
        }


        var total = 0.0//pick from the weighted list of steps
        for (var d in Memory.routeCache[locStr]['dests']['' + dest.id]) {
            total += Memory.routeCache[locStr]['dests']['' + dest.id][d];
        }

        var total = total * Math.random();

        var dir = 0;
        for (var d in Memory.routeCache[locStr]['dests']['' + dest.id]) {
            total -= Memory.routeCache[locStr]['dests']['' + dest.id][d];
            if (total < 0) {
                dir = d;
                break;
            }

        }

        if (creep.pos.getRangeTo(dest) > 1 && pathisBlocked(creep, dir)) {
            dir = Math.floor(Math.random() * 8);
        }

        var error = creep.move(dir);
        return error;
    }
};

function pathisBlocked(creep, dir) {

    var pos = creep.pos;

    var posd = new RoomPosition(pos.x, pos.y, pos.roomName);



    if(dir == TOP) {
        posd = new RoomPosition(pos.x, pos.y -1, pos.roomName);
    }
    else if(dir == BOTTOM){
        posd = new RoomPosition(pos.x, pos.y +1, pos.roomName);
    }
    else if(dir == LEFT){
        posd = new RoomPosition(pos.x -1, pos.y, pos.roomName);
    }
    else if(dir == RIGHT){
        posd = new RoomPosition(pos.x + 1, pos.y, pos.roomName);
    }
    else if(dir == TOP_RIGHT){
        posd = new RoomPosition(pos.x + 1, pos.y -1, pos.roomName);
    }
    else if(dir == TOP_LEFT){
        posd = new RoomPosition(pos.x -1, pos.y -1, pos.roomName);
    }
    else if(dir == BOTTOM_RIGHT){
        posd = new RoomPosition(pos.x +1, pos.y +1, pos.roomName);
    }
    else if(dir == BOTTOM_LEFT){
        posd = new RoomPosition(pos.x -1, pos.y +1, pos.roomName);
    }

    //TODO Straßen ignorieren
    var terrain = Game.map.getTerrainAt(posd);
    var struc = posd.lookFor(LOOK_STRUCTURES);
    var cons = posd.lookFor(LOOK_CONSTRUCTION_SITES);
    var creep_way = posd.lookFor(LOOK_CREEPS);


    //console.log('++++++++++++++++++++++++++++');
    //console.log(ots(creep.name));
    //console.log(ots(pos));
    //console.log(ots(dir));
    //console.log(ots(posd));
    //console.log(ots(creep_way));

    if(terrain == 'wall') {
        return true;
    }
    else if(struc.length) {
        return true;
    }
    else if(creep_way.length) {
        return true;
    }
    else if(cons.length) {
        return true;
    }
    else {
        return false;
    }
}

module.exports = move;