function MilkStompServer() {
	var config = require('config');
	var _ = require('lodash');
	var io = require('socket.io')();
	
	var MilkSocket = require('net/MilkSocket');
	var Player = require('player/Player');
	var router = new (require('router/MilkRouter'))();
	
	var players = {};

	function createPlayer(guid, socket) {
		var player = new Player(guid, socket);

		player.socket.on('data', function(message) {
			router.handle(message, player);
		});
		
		player.socket.on('close', function() {
			if (players[guid] !== undefined) {
				player.destroy();
				delete players[guid];
			}
		});

		return player;
	}
	
	this.boot = function() {
		io.listen(config.PORT, '0.0.0.0');

		io.on('connection', function(socket) {
			socket.setEncoding('utf8');
			socket = new MilkSocket(socket);
			players[socket.guid] = createPlayer(socket.guid, socket);
		});
		
		console.log("Server Initialised");
	}
}

module.exports = MilkStompServer;

new MilkStompServer().boot();