export function run(context, config) {
  return new Promise(f => {
    let ms = parseInt(config.ms || config.time) || 0;
    context.log(`Sleep for ${ms}ms.`);
    setTimeout(f, ms);
  });
}
