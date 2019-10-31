//log -1

//TODO Echte objeke durch Memory Einträge ändern solange nicht nötig (und danach über gobi zum objeckt machen)
//TODO Flaggen als marker verwenden um befehle zu erteilen
//TODO Engineer Creep erstellen
//TODO Figther Creeps erstellen
//TODO Fighter Ranget Creeps erstellen
//TODO Defender Creeps erstellen
//TODO Healer Creeps erstellen
//TODO Conqueror Creeps erstellen
//TODO Algorythmus für die Tier Produktion
//Hallo Welt

global.logging = 1;

global.JOB_MINER = 'miner';
global.PARTS_MINER = [MOVE, WORK, WORK, TOUGH, TOUGH];
global.JOB_TRANSPORTER = 'transporter';
global.PARTS_TRANSPORTER = [MOVE, MOVE, CARRY, CARRY, CARRY];
global.JOB_UPGRADER = 'upgrader';
global.PARTS_UPGRADER = [MOVE, CARRY, CARRY, CARRY, WORK];
global.JOB_BUILDER = 'builder';
global.PARTS_BUILDER = [MOVE, MOVE, CARRY, CARRY, WORK];


var helper = require('./helper');
var jobs = require('./jobs');
var rooms = require('./rooms');
var orders = require('./orders');

module.exports.loop = function () {
    PathFinder.use(true);
    global.log = helper.log;
    global.ots = helper.ots;
    global.add_creep_count = helper.add_creep_count;
    global.gobi = helper.gobi;
    global.get_new_id = helper.get_new_id;
    global.remove_id = helper.remove_id;
    global.create = helper.create;
    global.calc_spawn_tier = helper.calc_spawn_tier;
    global.calc_spawn_time = helper.calc_spawn_time;

    helper.

    //Baue Struktur
    helper.check_memory();
    helper.build_structure();
    helper.clean_structure();
    helper.upgrade_structure();


    //Order Verwaltung
    orders();

    //Raumverwaltung
    rooms(Game.rooms);

    //Creeps ihre Jobs ausführen lassen
    jobs();


    helper.cpu_mon();
    helper.clean_structure();
    helper.upgrade_structure();
};