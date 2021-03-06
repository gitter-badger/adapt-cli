var spawn = require("child_process").spawn;
var Q = require("q");
 
/**
 * Wrap executing a command in a promise
 * @param  {string} command command to execute
 * @param  {Array<string>} args    Arguments to the command.
 * @param  {string} cwd     The working directory to run the command in.
 * @return {Promise}        A promise for the completion of the command.
 */
module.exports = function exec(command, args, cwd) {
    if (!command || !cwd) {
        return Q.reject(new Error("Both command and working directory must be given, not " + command + " and " + cwd));
    }
    if (args && !args.every(function (arg) {
        var type = typeof arg;
        return type === "boolean" || type === "string" || type === "number";
    })) {
        return Q.reject(new Error("All arguments must be a boolean, string or number"));
    }
 
    var deferred = Q.defer();
 
    var proc = spawn(command, args, {
        cwd: cwd,
        stdio: global.DEBUG ? "inherit" : "ignore"
    });
    proc.on("error", function (error) {
        deferred.reject(new Error(command + " " + args.join(" ") + " in " + cwd + " encountered error " + error.message));
    });
    proc.on("exit", function(code) {
        if (code !== 0) {
            deferred.reject(new Error(command + " " + args.join(" ") + " in " + cwd + " exited with code " + code));
        } else {
            deferred.resolve();
        }
    });
    return deferred.promise;
};