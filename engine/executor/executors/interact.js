export function run(context, config) {
  return new Promise(function(f, r) {
    let page = context.page;
    switch (config.event) {
      case "mouseup":
      case "mousedown":
      case "mousemove":
      case "doubleclick":
      case "click":
        page.sendEvent(config.event, config.mouseX, config.mouseY);
        break;
      case "keyup":
      case "keypress":
      case "keydown":
        if (page.event.key[config.key] === undefined) {
          r(new Error("Unknown keyboard key value: " + config.key));
          return;
        }
        let mask = 0;
        if (config.modifiers.indexOf("Shift") >= 0) {
          mask = mask | 0x02000000;
        }
        if (config.modifiers.indexOf("Ctrl") >= 0) {
          mask = mask | 0x04000000;
        }
        if (config.modifiers.indexOf("Alt") >= 0) {
          mask = mask | 0x08000000;
        }
        page.sendEvent(config.event, page.event.key[config.key], null, null, mask);
        break;
      default:
        r(new Error("Unknown interaction type: " + config.event));
    }
    f(context);
  });
}
