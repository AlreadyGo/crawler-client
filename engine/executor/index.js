/*
Use executor.run(page, task_config, task_params, callback) to run a task, where:

- page: preconfigured web page object
- task_config: task configuration to run the task, array of objects/functions or bare object or function
- task_params: an object holds dynamic parameters for this task type, includes:
  - debug: debug mode or not, default: false
  - headers: custom headers to include in every HTTP request
  - cookies: an array of cookie object
  - url: initial url if provided
  - other custom params for task execution
- callback: the callback function to handle result after execution: callback(result) where:
  - result: an object to hold all results key-value pairs, in which:
    - error: the error message (override if previous execution stores an error key) if error occurs
    - debug: debug messages, e.g. execution logs, browser console errors, etc.
 */
const me = {
  run: function(page, task_config, task_params, callback) {
    if (task_params == null) {
      task_params = {};
    }
    let context = {
      page: page,
      args: task_params,
      result: {},
      debug: !!task_params.debug,
      run_config: promise.run_any,
      logs: []
    };
    if (context.debug) {
      context.result.debug = [];
    }
    context.log = function(msg) {
      context.logs.push(msg);
      if (context.debug) {
        context.result.debug.push(msg);
      }
      return msg;
    };
    let cb = function() {
      return Promise.resolve().then(function() {
        var base, config;
        //(base = context.result).client_ip || (base.client_ip = context.args.client_ip);
        if (context.args.hook) {
          if (typeof context.args.hook === 'function') {
            config = context.args.hook(context.args, context.result);
          } else if (typeof context.args.hook === 'string' && context.args.hook.indexOf('function') === 0) {
            config = eval("(" + context.args.hook + ")")(context.args, context.result);
          } else {
            return new Promise((f, r) => $.ajax({
              type: "POST",
              url: context.args.hook,
              data: JSON.stringify(context.result),
              contentType: "application/json; charset=utf-8",
              dataType: "json",
              success: f,
              error: r
            }));
          }
          config.type = "request";
          return promise.run_any(context, config);
        }
        return Promise.resolve(context);
      }).then(function() {
        if (typeof callback === 'function') {
          return setTimeout(function() {
            return callback(context.result);
          });
        }
      }, function(err) {
        context.logs.push("Error sending hook request: " + err);
        if (typeof callback === 'function') {
          return setTimeout(function() {
            return callback(context.result);
          });
        }
      }).then(() => {
        if (!me._dumpLog) return;
        console.log(
          `Crawler task result for task with params "${JSON.stringify(task_params)}" is: `, context.logs,
          'Task result is: ', context.result
        );
      });
    };
    /*
    customHeaders = { "Key" : "Value" }
     */
    if (task_params.headers) {
      page.settings.customHeaders = task_params.headers;
    }
    Promise.resolve().then(function() {
      if (context.args.url) {
        return promise.run_any(context, {
          url: context.args.url,
          type: 'request'
        });
      } else {
        return Promise.resolve(context);
      }
    }).then(function() {
      return promise.run_any(context, task_config);
    }).then(function() {
      return cb();
    }, function(err) {
      context.result.error = err;
      return cb();
    });

    // if callback is not a function then return a promise.
    if (typeof callback !== 'function') {
      let fulfill, reject;
      callback = function(data) {
        if (data.error || data.errors) reject(data);
        else fulfill(data);
      };
      return new Promise((f, r) => {
        fulfill = f;
        reject = r;
      });
    }
  }
};

const promise = me.promise = {
  run_any: function(context, step) {
    if (!step) {
      return Promise.resolve(context);
    }
    if (typeof step === 'function') {
      return promise.run_function(context, step);
    }
    if (!Array.isArray(step)) {
      return promise.run_object(context, step);
    }
    return new Promise(function(f, r) {
      let proc = Promise.resolve();
      step.forEach(item => {
        proc = proc.then(() => promise.run_any(context, item));
      });
      proc.then(f, r);
    });
  },
  run_object: function(context, step) {
    try {
      let executor = require(`./executors/${step.type || "extract"}`);
      return context.page.initSizzle().then(() => context.current = step).then(() => executor.run(context, step)).then(() => delete context.current);
    } catch (e) {
      return Promise.reject(new Error("Invalid config type " + step.type + " or failed to execute, error message: " + (e.toString()) + "\n" + e.stack));
    }
  },
  run_function: function(context, step) {
    return new Promise(function(f, r) {
      var steps;
      context.log("Executing " + (step.toString()));
      try {
        steps = step(context.args, context.result, context.page.url);
      } catch (e) {
        context.logs.push(e && e.toString());
      }
      if (!steps) {
        return f(context);
      }
      return promise.run_any(context, steps);
    });
  }
};

window.$toggleCrawlerLog = function() {
  me._dumpLog = !me._dumpLog;
  console.info(`Crawler log is ${me._dumpLog ? 'on' : 'off'}.`);
};

console.info('######## Use `$toggleCrawlerLog()` to toggle crawler execution log.');

export default me
