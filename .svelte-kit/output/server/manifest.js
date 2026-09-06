export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.svg","icons.svg","piano/A0.mp3","piano/A1.mp3","piano/A2.mp3","piano/A3.mp3","piano/A4.mp3","piano/A5.mp3","piano/A6.mp3","piano/A7.mp3","piano/C1.mp3","piano/C2.mp3","piano/C3.mp3","piano/C4.mp3","piano/C5.mp3","piano/C6.mp3","piano/C7.mp3","piano/C8.mp3","piano/Ds1.mp3","piano/Ds2.mp3","piano/Ds3.mp3","piano/Ds4.mp3","piano/Ds5.mp3","piano/Ds6.mp3","piano/Ds7.mp3","piano/Fs1.mp3","piano/Fs2.mp3","piano/Fs3.mp3","piano/Fs4.mp3","piano/Fs5.mp3","piano/Fs6.mp3","piano/Fs7.mp3"]),
	mimeTypes: {".svg":"image/svg+xml",".mp3":"audio/mpeg"},
	_: {
		client: {start:"_app/immutable/entry/start.DLgwj9pX.js",app:"_app/immutable/entry/app.DyWeHLiM.js",imports:["_app/immutable/entry/start.DLgwj9pX.js","_app/immutable/chunks/4NyYsitA.js","_app/immutable/chunks/DODMdrAD.js","_app/immutable/entry/app.DyWeHLiM.js","_app/immutable/chunks/DODMdrAD.js","_app/immutable/chunks/xihTtKlq.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			
		],
		prerendered_routes: new Set(["/"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
