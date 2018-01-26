export function run(context, config) {
  let selector = config.selector;
  if (typeof selector !== 'function' && typeof selector !== 'string') {
    return new Promise(function(f, r) {
      return r(new Error("Invalid selector " + (selector.toString())));
    });
  }
  return new Promise(function(f, r) {
    let value = config.value;
    if (value === undefined && config.ref !== undefined) {
      value = context.args[config.ref];
    }
    context.page.evaluate(function(conf) {
      try {
        let elements = typeof conf.selector === 'string' ? $(conf.selector) : conf.selector();
        if (!Array.isArray(elements) || elements.length === 0) {
          return {
            error: "Got nothing from url " + document.location + " with selector " + conf.selector
          };
        }
        if (conf.elementIndex !== undefined && conf.elementIndex >= elements.length) {
          return {
            error: "Element index out of bound from url " + document.location + " with selector " + conf.selector
          };
        }
        let element = elements[conf.elementIndex];
        switch (conf.event) {
          case "type":
          case "enter":
            if (!conf.value) {
              return {
                error: "Value is not specified to type into element from selector " + conf.selector
              };
            }
            element.value = conf.value;
            return {
              result: true
            };
          default:
            let event = document.createEvent("HTMLEvents");
            event.initEvent(conf.event, true, true);
            element.dispatchEvent(event);
            return {
              result: true
            };
        }
      } catch (e) {
        return { error: e.toString() };
      }
    }, {
      selector: selector,
      elementIndex: config.elementIndex || 0,
      event: config.event,
      value: value
    }).then(rs => {
      return rs.error ? r(rs.error) : f(context);
    });
  });
}
