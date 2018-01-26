export function run(context, config) {
  var elementIndex;
  if (typeof config.name !== "string") {
    return new Promise(function(f, r) {
      return r(new Error("Name (type of string) expected for extract operation!"));
    });
  }
  if (config.extract === "attr" && typeof config.attr === "undefined") {
    return new Promise(function(f, r) {
      return r(new Error("Attribute key is not defined for selector: " + config.selector));
    });
  }
  if (typeof config.format === "undefined") {
    config.format = function(v) {
      return v;
    };
  }
  if (typeof config.format !== "function") {
    return new Promise(function(f, r) {
      return r(new Error("Expected formatter: " + config.format.toString()));
    });
  }
  let selector = config.selector;
  if (typeof selector !== 'function' && typeof selector !== 'string') {
    return new Promise(function(f, r) {
      return r(new Error("Invalid selector " + (selector.toString())));
    });
  }
  if (config.resultType === "list") {
    delete config.elementIndex;
  } else {
    config.elementIndex = config.elementIndex || 0;
  }
  if (typeof config.elementIndex !== "undefined") {
    elementIndex = config.elementIndex;
    if (typeof elementIndex === "string" && elementIndex.match(/^\d+$/i)) {
      elementIndex = parseInt(elementIndex);
    }
    if (typeof elementIndex !== "number") {
      return Promise.reject(new Error("Expected value for elementIndex: " + elementIndex.toString()));
    }
  }
  if (config.ignore_not_found === undefined) {
    config.ignore_not_found = config.resultType === 'list';
  }
  return new Promise(function(f, r) {
    context.log("Extracting for `" + config.name + "` from url `" + context.page.getUrl() + "` with config: " + (JSON.stringify(config)));
    context.page.evaluate(function(conf) {
      try {
        conf.format = eval("(" + conf.format + ")");
        function getValue(el) {
          switch (conf.extract) {
            case "text":
              return conf.format(el.textContent);
            case "html":
              return conf.format(el.innerHTML);
            case "outerHtml":
              return conf.format(el.outerHTML);
            case "attr":
              return conf.format(el.getAttribute(conf.attr));
            default:
              throw new Error("Unknown extract type: " + conf.extract);
          }
        };
        var elements = typeof conf.selector === "string" ? $(conf.selector) : conf.selector();
        if (typeof(elements.length) !== 'number' || elements.length === 0) {
          if (conf.ignore_not_found) {
            return {
              result: conf.listResult ? [] : null
            };
          }
          return {
            error: "Got nothing from url " + document.location + " with selector " + conf.selector
          };
        }
        if (conf.elementIndex !== undefined && conf.elementIndex >= elements.length) {
          if (conf.ignore_not_found) {
            return {
              result: conf.listResult ? [] : null
            };
          }
          return {
            error: "Element index out of bound from url " + document.location + " with selector " + conf.selector
          };
        }
        if (conf.elementIndex !== undefined) {
          elements = [elements[conf.elementIndex]];
        }
        if (conf.listResult) {
          var rs = [];
          for (var i = 0; i < elements.length; i++) {
            rs.push(getValue(elements[i]));
          }
          return {
            result: rs
          };
        } else {
          return {
            result: getValue(elements[0])
          };
        }
      } catch (e) {
        return {
          error: e.toString()
        };
      }
    }, {
      selector: selector,
      elementIndex: elementIndex,
      listResult: config.resultType === "list",
      extract: config.extract,
      attr: config.attr,
      ignore_not_found: config.ignore_not_found,
      format: config.format.toString()
    }).then(rs => {
      if (rs.err) {
        return r(new Error(rs.err.message));
      }
      rs = rs.result;
      if (config.merge) {
        let result = [];
        if (typeof context.result[config.name] !== "undefined") {
          Array.prototype.push.apply(result, (Array.isArray(context.result[config.name]) ? context.result[config.name] : [context.result[config.name]]));
        }
        if (typeof rs !== "undefined") {
          Array.prototype.push.apply(result, (Array.isArray(rs) ? rs : [rs]));
        }
        context.result[config.name] = result;
      } else {
        context.result[config.name] = rs;
      }
      context.log("End extracting `" + config.name + "`.");
      return f(context);
    }).catch(r);
  });
}

