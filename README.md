# dsh-lan-loopback-compat

> Treat connections that arrive through a LAN proxy as loopback, so a DeepSeek Harness
> instance reached over a LAN or a tunnel keeps its browser connection working.
>
> 把经 LAN 代理进来的连接当成 loopback，让通过局域网 / 隧道访问的 DSH 实例保持浏览器连接可用。

[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## 它解决什么

DSH 的 client 会按 `connection.isLoopback` 判断「我是不是在本机打开」。当实例是通过反向代理或
LAN 转发访问时，这个判断为假，连接层的一些本机假定就不成立（表现为连接异常/被拒）。

本插件在**客户端**把该标志置为真 —— 前提是宿主显式声明了它确实处在 LAN 代理之下。

## 它做什么

```js
// client.js 全部逻辑
if (globalThis.__DSH_LAN_PROXY__ !== true || ctx.connection === undefined) return;
ctx.connection.isLoopback = true;
globalThis.__DSH_LAN_COMPAT_PLUGIN__ = true;
```

- 只有 `globalThis.__DSH_LAN_PROXY__ === true` 时才动手；条件不满足则**完全不碰**任何东西。
- 监听 `connection/reset` 事件，连接重建后重新打标（否则重连会丢）。
- 打上 `globalThis.__DSH_LAN_COMPAT_PLUGIN__ = true` 自证已生效。
- host 半边（`index.js`）是空 `apply()` —— 它存在只为了让 cordis 行能挂载 client bundle。

## 安装

```bash
dsh plugin --profile <profile> add github:jipika/dsh-lan-loopback-compat
```

```yaml
# ~/.dsh/profiles/<profile>/cordis.patch.yml
- insert:
    - id: dsh-lan-loopback-compat
      name: dsh-lan-loopback-compat
```

`__DSH_LAN_PROXY__` 由外部（代理页面 / 启动脚本）注入；本插件不设置它。

`desktop` profile 被 Electron 独占（CLI 子命令会被拒），需手改 `package.json` + `pnpm install`；
**改 client 半边必须重启应用**。

## 已知限制

- 直接改写 client 服务对象上的属性，依赖 `isLoopback` 这个内部约定；官方若改成 getter
  或受保护属性，写法即失效（会静默不生效，因为整段逻辑只做赋值）。
- 依赖 `connection/reset` 事件名。
- 安全性说明：它**不会**自己把实例暴露到 LAN —— 只有外部已声明处于 LAN 代理时才生效，
  真正的访问控制仍由 DSH 的鉴权负责。

## License

MIT © 2026 jipika
