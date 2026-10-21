# 星黎宇宙官网

星黎宇宙 Stellae.AI 官方展示网站，同一套网页自适应 PC 与手机。

本仓库保存 2026-10-21 的完整部署版本，包括开场动画、三维场景、角色视频、功能实录、场景截图与可滑动的羁绊卡片。

## 目录

- `www/`：完整静态网站，部署时将此目录设为 Web 根目录。
- `docs/DEPLOYMENT.zh-CN.txt`：详细部署、配置与验收说明。
- `docs/manifest.json`：网站文件大小与 SHA-256 校验清单。

## 部署

使用 Nginx、IIS、静态托管或 CDN 提供 `www/` 的内容，默认首页为 `index.html`。

这是无需构建的 HTML/CSS/JavaScript 网站，不需要 npm 安装、Node 服务或数据库。保持 `assets/` 的完整目录层级和文件名大小写，并使用正确的 JavaScript MIME；视频服务需要支持字节范围请求。

网站使用 `#home` 等 hash 导航，刷新会从首页开始。详细服务器设置见部署说明。

## 上线配置

编辑 `www/site-config.js`：

- 填写 `downloads.ios.url` 和 `downloads.android.url`，目前下载入口尚未配置。
- 填写版本、设备要求以及 `legal.privacy`、`legal.terms`。
- 确认公司、备案信息和 `roomUrl`。

当前 Room 地址为 `https://www.stellae.world/room/`。部署官网首页时保留线上已有的 `/room/` 应用与服务路由；本仓库不包含 Room 应用或手机安装包。

## 维护

直接修改 `www/` 内的源文件。发布更新时同步所有被修改的文件，并刷新同名资源的 CDN 缓存；HTML、JavaScript、CSS 与配置文件建议重新验证缓存。

`docs/manifest.json` 对应本次交付快照，修改资源后需要重新生成对应校验值。

## 第三方许可

随资源保留以下许可文件：

- `www/HOLO-REFERENCE-LICENSE.txt`
- `www/assets/vendor/rhine-boot-LICENSE.txt`
- `www/assets/vendor/three/LICENSE.txt`
