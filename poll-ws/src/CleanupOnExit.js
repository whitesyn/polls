// Object to capture process exits and call app specific cleanup function
function noop() {}

/**
 * Perform cleanup actions on process end.
 *
 * @param {Function} callback Cleanup callback function.
 * @param {Object} logger Logger object instance.
 *
 * @returns {void}
 */
function cleanup(callback, logger) {
  // attach user callback to the process event emitter
  // if no callback, it will still exit gracefully on Ctrl-C
  const cleanupCallback = callback || noop;
  process.on('cleanup', cleanupCallback);

  // do app specific cleaning before exiting
  process.on('exit', () => {
    process.emit('cleanup');
  });

  // catch ctrl+c event and exit normally
  process.on('SIGINT', () => {
    process.exit(2);
  });

  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', () => {
    process.exit(0);
  });
  process.on('SIGUSR2', () => {
    process.exit(0);
  });

  //catch uncaught exceptions, trace, then exit normally
  process.on('uncaughtException', e => {
    logger.error(`Uncaught Exception: ${e.message} - ${e.stack}`);
    process.exit(1);
  });
}

module.exports = cleanup;
