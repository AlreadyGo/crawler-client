export function run(context, config) {
  return new Promise(function(f, r) {
    if (typeof config.selector === 'function')
      context.log("Waiting for browser side function `" + config.selector + "` to return true, timeout " + (config.tries || 10) + " seconds.");
    else
      context.log("Waiting for element `" + config.selector + "`, timeout " + (config.tries || 10) + " seconds.");
    context.page.waitFor(config.selector, config.tries || 10, function(success) {
      if (success) {
        return f(context);
      } else {
        //context.page.render("screen.png");
        if (config.fallback) {
          if (typeof config.fallback === 'boolean') {
            return f(context);
          } else {
            return context.run_config(context, config.fallback).then(f, r);
          }
        } else {
          return r(new Error("Unable to find " + config.selector + "."));
        }
      }
    }, [context.args, context.result]);
  });
}
