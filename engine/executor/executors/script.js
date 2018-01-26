function runAndWait(context, config) {
  return new Promise(function(f, r) {
    context.log("Executing browser script: " + (config.func.toString()));
    context.page.initSizzle().then(() => {
      return context.page.evaluate(function(conf) {
        try {
          var key = Math.random();
          var callback = function() {
            if (!key) return;
            window[key] = conf.result;
          };
          setTimeout(function() {
            window[key] = { error: 'timeout' };
            key = null;
          }, conf.timeout);
          (eval("(" + conf.func + ")"))(conf.args, conf.result, callback);
          return key;
        } catch (e) {
          return { error: e };
        }
      }, {
        args: context.args,
        result: context.result,
        func: config.func.toString(),
        timeout: (config.timeout || 10) * 1000
      }).then(rs => {
        if (rs.error) {
          return r(rs.error);
        } else {
          return f(rs);
        }
      });
    }).catch(r);
  }).then(key => {
    return new Promise(function(f, r) {
      context.page.waitFor(function(key) {
        return !!window[key];
      }, config.timeout || 10, function(success) {
        if (success) {
          return f(key);
        } else {
          r('timeout');
        }
      }, [key]);
    });
  }).then(key => {
    return context.page.evaluate(function(key) {
      var result = window[key];
      delete window[key];
      if (!result) return Promise.reject('timeout');
      return result;
    }, key).then(result => {
      if (result) context.result = result;
      return context;
    });
  });
}

export function run(context, config) {
  if (typeof config.func !== 'function') {
    return new Promise(function(f, r) {
      context.log("Executing script " + ((config.func || '').toString()));
      r(new Error('We need a function to execute.'));
    });
  }
  if (config.async === true) {
    return runAndWait(context, config);
  }
  return new Promise(function(f, r) {
    context.log("Executing browser script: " + (config.func.toString()));
    context.page.evaluate(function(conf) {
      try {
        (eval("(" + conf.func + ")"))(conf.args, conf.result);
        return { result: conf.result };
      } catch (e) {
        return { error: e };
      }
    }, {
      args: context.args,
      result: context.result,
      func: config.func.toString()
    }).then(rs => {
      if (rs.err) {
        r(rs.err);
      } else {
        if (rs.result) context.result = rs.result;
        f(context);
      }
    }).catch(r);
  });
}
