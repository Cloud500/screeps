//Positionen sind Dictionary mit x und y werten

/**
 * Berechnet die differenzen und gibt entsprechendes ergebniss zurück
 * @param cur_pos Aktuelle (alte) Position
 * @param way_pos Nächste Position
 * @param dest_pos Zielposition
 * @return {Boolean} true wenn differenz ok, false wenn nicht
 **/
function is_diff_ok(cur_pos, way_pos, dest_pos) {
    //Berechnen der aktuellen und neuen Differenz
    var org_diff = {};
    var new_diff = {};
    org_diff.x = cur_pos.x - dest_pos.x;
    org_diff.y = cur_pos.y - dest_pos.y;
    new_diff.x = way_pos.x - dest_pos.x;
    new_diff.y = way_pos.y - dest_pos.y;

    //Negative Differenzen begleichen
    //Auch die Neuen immer wenn die Originalen negativ sind um ein "dran vorbei laufen" zu vermeiden
    if(org_diff.x < 0) {
        org_diff.x = org_diff.x * -1;
        new_diff.x = new_diff.x * -1;
    }

    if(org_diff.y < 0) {
        org_diff.y = org_diff.y * -1;
        new_diff.y = new_diff.y * -1;
    }

    //Kontrolle ob die differenz nicht größer wird
    if(new_diff.x <= org_diff.x && new_diff.y <= org_diff.y) {
        return true
    }
    else {
        return false
    }
}

/**
 * Finden der nächsten optimalen position in richtung des Ziels
 * @param cur_pos Aktuelle (alte) Position
 * @param dest_pos Zielposition
 * @param road Optional, nur nach Wegen suchen? Standard = true
 * @return {Dict} Neue Wegpunkt position
 **/
function find_next_spot(creep, cur_pos, dest_pos, road) {
    road = road || true;
    var way_pos = {};

    //Nach Oben Rechts
    if(cur_pos.x - dest_pos.x < 0 && cur_pos.y - dest_pos.y > 0) {
        way_pos.x = cur_pos.x + 1;
        way_pos.y = cur_pos.y - 1;
        
        if(is_diff_ok(cur_pos, way_pos, dest_pos)) {
            if(road == true) {
                if (is_road(creep, way_pos) == true) {
                    return way_pos;
                }
            }
            else {
                return way_pos;
            }
        }

    }
    //Nach Oben Links
    else if(cur_pos.x - dest_pos.x > 0 && cur_pos.y - dest_pos.y > 0) {
        way_pos.x = cur_pos.x - 1;
        way_pos.y = cur_pos.y - 1;
        
        if(is_diff_ok(cur_pos, way_pos, dest_pos)) {
            if(road == true) {
                if (is_road(creep, way_pos) == true) {
                    return way_pos;
                }
            }
            else {
                return way_pos;
            }
        }
    }
    //Nach Unten Links
    else if(cur_pos.x - dest_pos.x > 0 && cur_pos.y - dest_pos.y < 0) {
        way_pos.x = cur_pos.x - 1;
        way_pos.y = cur_pos.y + 1;

        if(is_diff_ok(cur_pos, way_pos, dest_pos)) {
            if(road == true) {
                if (is_road(creep, way_pos) == true) {
                    return way_pos;
                }
            }
            else {
                return way_pos;
            }
        }
    }
    //Nach Unten Rechts
    else if(cur_pos.x - dest_pos.x < 0 && cur_pos.y - dest_pos.y < 0) {
        way_pos.x = cur_pos.x + 1;
        way_pos.y = cur_pos.y + 1;
        
        if(is_diff_ok(cur_pos, way_pos, dest_pos)) {
            if(road == true) {
                if (is_road(creep, way_pos) == true) {
                    return way_pos;
                }
            }
            else {
                return way_pos;
            }
        }
    }
    //Nach Oben
    else if(cur_pos.y - dest_pos.y > 0) {
        way_pos.x = cur_pos.x;
        way_pos.y = cur_pos.y - 1;
        
        if(is_diff_ok(cur_pos, way_pos, dest_pos)) {
            if(road == true) {
                if (is_road(creep, way_pos) == true) {
                    return way_pos;
                }
            }
            else {
                return way_pos;
            }
        }
    }
    //Nach Unten
    else if(cur_pos.y - dest_pos.y < 0) {
        way_pos.x = cur_pos.x;
        way_pos.y = cur_pos.y + 1;
        
        if(is_diff_ok(cur_pos, way_pos, dest_pos)) {
            if(road == true) {
                if (is_road(creep, way_pos) == true) {
                    return way_pos;
                }
            }
            else {
                return way_pos;
            }
        }
    }
    //Nach Links
    else if(cur_pos.x - dest_pos.x > 0) {
        way_pos.x = cur_pos.x - 1;
        way_pos.y = cur_pos.y;
        
        if(is_diff_ok(cur_pos, way_pos, dest_pos)) {
            if(road == true) {
                if (is_road(creep, way_pos) == true) {
                    return way_pos;
                }
            }
            else {
                return way_pos;
            }
        }
    }
    //Nach Rechts
    else if(cur_pos.x - dest_pos.x < 0) {
        way_pos.x = cur_pos.x + 1;
        way_pos.y = cur_pos.y;
        
        if(is_diff_ok(cur_pos, way_pos, dest_pos)) {
            if(road == true) {
                if (is_road(creep, way_pos) == true) {
                    return way_pos;
                }
            }
            else {
                return way_pos;
            }
        }
    }
    //Ohne Weg versuchen
    else if(is_road == true) {
        find_next_spot(creep, cur_pos, dest_pos, false);
    }
    //Kein weg möglich
    else {
        console.log('Kein Weg gefunden');
        return cur_pos;
    }
}

/**
 * Bewegungsfunktion um einen Creep zu seinem eingetragenen Target zu bewegen
 * @param creep Creeper der sich bewegen soll
 */
function move(creep) {
    //Initialisieren der Variablen
    var way_pos = {};
    var pos = {};
    var target = {};

    //Zielposition festlegen
    target.x = Game.getObjectById(creep.memory.target).pos.x;
    target.y = Game.getObjectById(creep.memory.target).pos.y;

    //Aktuelle Position festlegen
    pos.x = creep.pos.x;
    pos.y = creep.pos.y;

    //Nächsten Wegpunkt suchen
    way_pos = find_next_spot(creep, pos, target, true);

    //Zu nächsten Wegpunkt bewegen
    creep.moveTo(new RoomPosition(way_pos.x, way_pos.y, creep.name + '_target'), {reusePath: 0});
}

/**
 * Schaut ob an der way_pos eine Straße ist
 * @param creep Creeper der sich bewegen soll
 * @param way_pos Nächste Wegmarke
 * @returns {boolean} true wenn Straße vorhanden, false wenn nicht
 */
function is_road(creep, way_pos) {
    var look = creep.room.lookAt(way_pos.x, way_pos.y);
    look.forEach(function(lookObject) {
        if(lookObject.type == LOOK_STRUCTURES && lookObject[LOOK_STRUCTURES].structureType == STRUCTURE_ROAD) {
            return true;
        }
    });
    return false;
}

/**
 * Main funktion
 * @param creep Creeper der sich bewegen soll
 **/
module.exports = function(creep) {
    move(creep);
};