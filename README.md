# 星黎宇宙官网

星黎宇宙 Stellae.AI 官方展示网站，同一套网页自适应 PC 与手机。

本仓库以 2026-10-21 的部署版本为基线，2026-10-23 更新了文案与媒体。开场、UI、三维场景和交互代码保持原样；本次为本地审阅版本，未发布线上。

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

- `downloads.ios.url` 和 `downloads.android.url` 当前指向星黎频道，通过共创群了解内测资格与安装方式，按钮明确标注为共创空间入口。
- 填写版本、设备要求以及 `legal.privacy`、`legal.terms`。
- 确认公司、备案信息和 `roomUrl`。

星黎频道地址为 `https://www.stellae.world/room/`。部署官网首页时保留线上已有的 `/room/` 应用与服务路由；本仓库不包含星黎频道应用或手机安装包。以后改为直链下载时，同时更新 `app.js` 中的入口按钮文案，避免混淆入口性质。

## 本地审阅与媒体重建

运行 `python3 tools/preview_server.py` 后打开 `http://127.0.0.1:8853/`。预览服务仅绑定本机，支持视频 Range 请求，并禁用缓存以避免看到旧视频或旧配置。

`tools/build_media_v3.py` 使用已脱敏补拍素材与原版回退副本生成 84 秒主片、五个功能短片和封面；`tools/promo_style.py` 复用原产品片美术。需要本机 FFmpeg、Pillow、OpenCV、思源宋体与苹方，以及脚本标注的本地素材路径。

六张场景图库仍为原来的场景和构图，只处理必要头像隐私，等待用户定义后重新截图定稿。详见 `docs/内容更新说明-20261023.md`。

## 维护

直接修改 `www/` 内的源文件。发布更新时同步所有被修改的文件，并刷新同名资源的 CDN 缓存；HTML、JavaScript、CSS 与配置文件建议重新验证缓存。

`docs/manifest.json` 对应本次交付快照，修改资源后需要重新生成对应校验值。

## 第三方许可

随资源保留以下许可文件：

- `www/HOLO-REFERENCE-LICENSE.txt`
- `www/assets/vendor/rhine-boot-LICENSE.txt`
- `www/assets/vendor/three/LICENSE.txt`
