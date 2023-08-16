var PropHuntGroup = require("./PropHuntGroup.js");
var PropHuntUser = require("./PropHuntUser.js");
var PropHuntUserList = require("./PropHuntUserList.js");

var Packets = require("./Packets.js");
const Errors = require("./Errors.js");
var Util = require("./Util.js");
var Config = require("./Config.js");

class PropHuntGroupList {
	constructor() {
		this.groups = {};
	}

	createGroup(server, message, offset, remote, jwt) {
		/*var sizeBuffer = 1; //read jwt
		var groupDetails = Packets.utf8Serializer(message, sizeBuffer, offset, remote);
		offset = groupDetails.offset;

		if (groupDetails.data.length >= sizeBuffer) {
			var jwt = groupDetails.data[0];*/
		let users = server.getUsers();
		let verify = server.verifyJWT(jwt);
		if (verify.id) {
			var userId = verify.id;
			if (users.users[userId] != null) {
				let world = users.users[userId].world;
				if (Util.isValidWorld(world)) {
					if (!this.groups[userId]) {
						this.groups[userId] = new PropHuntGroup(userId, world);
						// add the creator to the list of users -- group ID is synonymous with the user ID
						this.addUser(userId, userId);
						server.serverLog(users.users[userId].username + " has created a group (" + userId + ")");
					} else {
						server.sendError(Errors.Error.ALREADY_IN_GROUP, remote);
					}
				} else {
					server.sendError(Errors.Error.INVALID_WORLD, remote);
				}
			} else {
				server.sendError(Errors.Error.INVALID_LOGIN, remote);
			}
		}
		//}
	}

	joinGroup(server, message, offset, remote, token) {
		var sizeBuffer = 1; //read groupId
		var groupDetails = Packets.utf8Serializer(message, sizeBuffer, offset, remote);
		offset = groupDetails.offset;

		console.log("joining group: " + token);
		if (token) {
			if (groupDetails.data.length >= sizeBuffer) {
				var groupId = groupDetails.data[0];
				var verify = server.verifyJWT(token);
				if (verify.id) {
					var user = server.getUsers().users[verify.id];
					if (user) {
						if (this.groups[groupId]) {
							if (!this.groups[groupId].users[verify.id]) {
								var userId = token.id;
								console.log(user.username + " joined group " + groupId);
								this.addUser(groupId, userId);
							} else {
								// the user is already in the group
								server.sendError(Errors.Error.ALREADY_IN_GROUP, remote);
							}
						} else {
							console.debug("tried joining invalid group " + groupId);
							server.sendError(Errors.Error.INVALID_GROUP, remote);
						}
					} else {
						server.sendError(Errors.Error.INVALID_LOGIN, remote);
					}
				} else {
					server.sendError(Errors.Error.INVALID_LOGIN, remote);
				}
			}
		}
	}

	setPlayerProp(server, message, offset, remote) {
		var sizeBuffer = 1; //read jwt
		var groupDetails = Packets.utf8Serializer(message, sizeBuffer, offset, remote);
		offset = groupDetails.offset;
	}

	addUser(groupId, userId) {
		if (this.groups[groupId]) {
			if (!this.groups[groupId].users[userId]) {
				this.groups[groupId].users[userId] = {
					status: 0,
					team: 0,
					prop: 0,
					location: { x: 0, y: 0, z: 0 },
					orientation: 0,
				};
			} else {
				return Errors.Error.ALREADY_IN_GROUP;
			}
		} else {
			return Errors.Error.INVALID_GROUP;
		}
	}
}

module.exports = PropHuntGroupList;
