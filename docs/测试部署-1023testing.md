# 2026-10-23 测试子路径部署

- 测试地址：<https://www.stellae.world/room/1023testing/>
- 审阅 PR：<https://github.com/nightraven-bee/stellae-website/pull/1>（草稿，未合并）
- 网站内容提交：`78f5900309a8665a0ec076b780938fe56f462efb`。后续部署说明提交只修改文档，`www/` 内容不变。
- 发布范围：提交中的 `www/`，89 个文件、50,425,725 字节。未上传原始录屏、隐私核查图或回退副本。
- 服务器目录：`/www/stellae/room/1023testing`。利用现有 `/room/` 静态路由，未修改或重载 Nginx。

## 已验证

1. 从 Git 提交生成归档，在本机及服务器上按 `docs/manifest.json` 校验全部 89 个文件的大小和 SHA-256。
2. 从公网 HTTPS 下载全部 89 个文件，HTTP 200，文件大小和 SHA-256 全部一致。
3. 产品视频 Range 请求返回 HTTP 206、`Content-Range: bytes 0-1023/15231497`，MIME 为 `video/mp4`。
4. 无末尾斜线的 `/room/1023testing` 自动跳转到相同 HTTPS 地址的末尾斜线路径，返回正确首页。
5. 正式官网与 `/room/` 首页公网 HTTP 200，内容哈希与部署前一致。服务器 `/bp/`、`/AlphaTesting/`、`/cocreate/` 首页及两份 Nginx 配置也与部署前一致。

本地播放器与视觉验收见[内容更新说明](内容更新说明-20261023.md)。线上浏览器检查工具绑定页面连续超时，本次线上结果以完整 HTTPS 文件校验和视频 Range 检查为依据，未将其记为线上交互验收通过。

## 发布记录与回退

- 服务器发布记录：`/home/ai_test/releases/stellae-1023testing-78f5900/`，保留归档、清单、来源记录、`release.json` 和公网校验报告。
- 归档 SHA-256：`2007e26f2d44100e48a301b315c27ece5a96cfc01f4a8a14640a4133e07b1375`。
- 回退脚本：上述发布目录的 `rollback.py`。脚本先确认当前测试目录仍与发布清单一致，再将该目录移动至发布记录目录的 `www-withdrawn`；不会覆盖正式首页或现有频道首页。尚未执行回退。

场景图库仍等待用户定义后重新截图；配乐 `listening_check: NOT_PERFORMED`，连续实际听感验收待完成。
