const open_url = function(context, url) {
  return post(context, url);
};

const post = function(context, url, data) {
  if (url === undefined) {
    return new Promise(function(f, r) {
      return r(new Error("You must specify the url."));
    });
  }
  return new Promise(function(f, r) {
    if (typeof url === 'function') {
      url = url(context.args, context.result);
    }
    if (data) {
      context.log("Sending data to url " + url + " with data " + (JSON.stringify(data)));
    } else {
      context.log("Opening " + url);
    }
    return context.page.requestUrl(url, data, function(rs) {
      if (rs instanceof Error) {
        return r(rs);
      } else {
        return f(context);
      }
    });
  });
};

export function run(context, config) {
  if (config.data === undefined) {
    return open_url(context, config.url);
  } else {
    return post(context, config.url, config.data);
  }
}
