var PropHuntGroupList = require("./PropHuntGroupList.js");
var PropHuntUserList = require("./PropHuntUserList.js");

const dgram = require("dgram");
const Config = require("./Config.js");
const Packets = require("./Packets.js");
const Errors = require("./Errors.js");

const JWT = require("jsonwebtoken");

class PropHuntServer {
	#server;
	#users;
	#groups;

	constructor() {
		this.server = dgram.createSocket("udp4");

		this.server.on("error", (error) => {
			this.#handleError(error);
		});

		this.server.on("message", (message, remote) => {
			this.#handleMessage(message, remote);
		});

		this.server.on("listening", () => {
			this.serverLog("Prop hunt server started");
		});

		this.server.bind(Config.SERVER_PORT);

		this.groups = new PropHuntGroupList();
		this.users = new PropHuntUserList();
	}

	#handleMessage(message, remote) {
		try {
			if (message.length < 3) {
				this.serverLog("\x1b[31mMalformed packet: Insufficient data length");
				return;
			}

			var offset = 0;

			const action = message.readUInt8(0);
			if (action < 0 || action > Packets.Packet.length) {
				this.serverLog("\x1b[31mUnsupported packet action: " + Packets.Packets[action]);
				return;
			}

			offset++;

            // TODO: JWT should always be received here and passed to the rest of the functions as needed

			if (Packets.Packets[action] != null) {
				switch (action) {
					case Packets.Packet.USER_LOGIN:
						this.users.login(this, message, offset, remote);
						break;

					case Packets.Packet.GROUP_NEW:
						this.groups.createGroup(this, message, offset, remote);
						break;

					case Packets.Packet.GROUP_JOIN:
						this.groups.joinGroup(this, message, offset, remote);
						break;
				}
			}
		} catch (error) {
			this.serverLog("Error receiving packet");
			console.debug(error);

			// this.handleError ?
		}
	}

	sendError(error, remote) {
		if (remote && remote.address && remote.port) {
			let action = Buffer.alloc(1);
			action.writeUInt8(Packets.Packet.ERROR_MESSAGE);
			let msg = Buffer.alloc(2);
			msg.writeUInt16BE(error);
			let buffer = Buffer.concat([action, msg]);

			return this.server.send(buffer, 0, buffer.length, remote.port, remote.address, (err) => {
				if (err) {
					console.error("Error sending response:", err);
				}
			});
		} else {
			return false;
		}
	}

	#handleError(error) {
		// i can fix her
		console.debug(error);
	}

	serverLog(message) {
		const address = this.server.address();
		console.log("[\x1b[34m" + address.address + "\x1b[39m:\x1b[37m" + address.port + "\x1b[39m]: \x1b[32m" + message + "\x1b[39m");
	}

	getGroups() {
		return this.groups;
	}

	getUsers() {
		return this.users;
	}

	verifyUser(userId, jwt) {
        jwt = this.verifyJWT(jwt);
        if(jwt.id == userId) {
            return true;
        }
	}

	getJWT() {
		return JWT;
	}

	verifyJWT(jwt) {
		try {
			return this.getJWT().verify(jwt, Config.JWT_SECRET_KEY);
		} catch (error) {
			if (error.message === "jwt malformed") {
				return false;
			}
			console.error(error);
			return false;
		}
	}
}

module.exports = PropHuntServer;
