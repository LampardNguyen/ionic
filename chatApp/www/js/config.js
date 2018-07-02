/* Insert your QB application credentials here
-----------------------------------------------*/
var QBAPP = {
	appID: 20537,
	authKey: 'DjhYU8kuVbJLCg-',
	authSecret: 'fQ7atuvWMWseZUw',
	config: {
		ssl: false,
		debug: false,
		endpoints:{
			api: 'api.quickblox.com',
			chat: 'chat.quickblox.com',
			muc: 'muc.chat.quickblox.com',
			turn: 'turnserver.quickblox.com',
			s3Bucket: 'qbprod',
		},
		chatProtocol:{
			bosh: 'http://chat.quickblox.com:8080',
			websocket: 'wss://chat.quickblox.com:8080',
			active: 1
		}
	}
};