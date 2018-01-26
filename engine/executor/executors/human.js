export function run(context, config) {
  let page = context.page;
  let { hint = '数据抓取任务需要人工干预', waitFor } = config;
  if (!page || typeof(page.show) !== 'function') {
    return Promise.reject(new Error("Current crawler does not support human interception."));
  }
  page.show(hint);
  return new Promise((f, r) => {
    let waiting = true;
    const cancel = msg => {
      waiting = false;
      r(msg);
    };
    page.once('hide', () => cancel('User canceled'));
    const check = () => {
      if (!waiting) return;
      new Promise(c => setTimeout(c, 1000)).then(() => {
        page.waitFor(waitFor, 1, found => {
          if (found) return f();
          setTimeout(check);
        }, [context.args, context.result]);
      }).catch(cancel);
    }
    check();
  });
}
