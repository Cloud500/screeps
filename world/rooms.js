//log -40
module.exports = function(rooms) {
    var orders = require('./orders');
    var spawner = require('./rooms_spawns');



    for(var id in Memory.spawns){
        spawner(id)
    }



};