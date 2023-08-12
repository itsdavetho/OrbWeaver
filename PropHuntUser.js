var Util = require('./Util.js');
const {
    v4: uuidv4
} = require('uuid');
uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'

class PropHuntUser {
    constructor(name) {
        this.name = name;
        this.active = Util.currentTime();
        this.status = 0; // prop: 0 = not found, 1 = found, 
        this.team = 0; // 0: prop, 1: seeker, 2: spectator
        this.prop = 0; // model id
        this.id = uuidv4();
        this.location = {"x": 0, "y": 0, "z": 0};
        this.orientation = 0;
        return this;
    }

    login(token, data, client, server) {
        console.debug(data);
        console.debug(token);
    }
}

module.exports = PropHuntUser;