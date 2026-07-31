# Env Guard

Env Guard is a Chrome extension that helps users clearly identify whether the current page belongs to a production, test, or development environment. It displays a configurable environment marker on matching pages, reducing the risk of accidentally operating on production data.

Env Guard 是一款 Chrome 浏览器扩展，用于帮助用户快速识别当前页面属于生产环境、测试环境还是开发环境。插件会根据配置规则在页面上显示环境标记，降低误操作生产环境数据的风险。

## Extension Path

The extension source code is located here:

`browser_extension/Env_Guard`

插件源码目录：

`browser_extension/Env_Guard`

## Key Features

- Configurable environment rules based on page URL.
- Support for production, test, development, or custom environment labels.
- Custom marker color, opacity, font size, and default position.
- Draggable marker with remembered position.
- SPA-friendly URL change detection.
- Built-in rule testing in the options page.
- JSON import and export for configuration backup and sharing.

## 主要功能

- 支持按页面 URL 配置环境识别规则。
- 支持生产环境、测试环境、开发环境或自定义环境名称。
- 支持自定义标记颜色、透明度、字体大小和默认显示位置。
- 支持拖拽标记，并记住拖动后的位置。
- 支持单页应用页面 URL 变化后的实时识别。
- 配置页内置规则测试功能。
- 支持 JSON 配置导入和导出，方便备份与迁移。

## Installation

1. Download or clone this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select `browser_extension/Env_Guard`.

## 安装方式

1. 下载或克隆本仓库。
2. 打开 Chrome，进入 `chrome://extensions/`。
3. 打开右上角 **开发者模式**。
4. 点击 **加载已解压的扩展程序**。
5. 选择 `browser_extension/Env_Guard` 目录。

## Documentation

For detailed usage and configuration instructions, see:

`browser_extension/Env_Guard/README.md`

详细使用和配置说明请查看：

`browser_extension/Env_Guard/README.md`

## Copyright

Copyright (c) 2026 Linlei-dev. All rights reserved.

This project is proprietary software. Without prior written permission from the copyright holder, no individual or organization may copy, modify, distribute, publish, sublicense, sell, or use this project for commercial purposes.

## 版权声明

版权所有 (c) 2026 Linlei-dev。保留所有权利。

本项目为专有软件。未经版权持有人事先书面许可，任何个人或组织不得复制、修改、分发、发布、再授权、销售本项目，或将本项目用于商业用途。
