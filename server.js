const http = require('http');
const app = require('./app');

app.use(require('sanitize').middleware);

// renvoi un port valide
const normalizePort = val => {
	const port = parseInt(val, 10);

	if (isNaN(port)) return val;
	if (port >= 0) return port;
	return false;
};
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// gestion des retours d'erreurs
const errorHandler = error => {
    if (error.syscall !== 'listen') throw error;
  
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;

	if (error.code === 'EACCES'){
		console.error(bind + ' requires elevated privileges.');
		process.exit(1);
	}

	if (error.code === 'EADDRINUSE') {
		console.error(bind + ' is already in use.');
		process.exit(1);
	}

	throw error;
};

const server = http.createServer(app);
server.on('error', errorHandler);
server.on('listening', () => {
	const address = server.address();
	const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
	console.log('Listening on ' + bind);
});

server.listen(port);