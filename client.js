window.__ModuleLoader__.load({
  id: "dsh-lan-loopback-compat",
  factory: () => {
    const module = { exports: {} };
    const exports = module.exports;

    const inject = ["connection"];

    function apply(ctx) {
      const applyLoopbackMode = () => {
        if (globalThis.__DSH_LAN_PROXY__ !== true || ctx.connection === undefined) return;
        ctx.connection.isLoopback = true;
        globalThis.__DSH_LAN_COMPAT_PLUGIN__ = true;
      };

      applyLoopbackMode();
      ctx.on("connection/reset", applyLoopbackMode);
    }

    exports.inject = inject;
    exports.apply = apply;
    return module.exports;
  }
});
