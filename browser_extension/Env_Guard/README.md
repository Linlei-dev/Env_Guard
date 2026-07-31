# Env Guard

Env Guard is a lightweight Chrome extension for marking the current page environment. It helps users quickly distinguish production, test, and development environments, reducing the risk of operating on production data by mistake.

Env Guard 是一款轻量级 Chrome 扩展，用于在页面上标记当前环境，帮助用户快速识别生产环境、测试环境和开发环境，降低误操作生产环境数据的风险。

## 中文说明

### 功能特性

- **环境标记**：根据 URL 匹配规则，在页面上显示“生产环境”“测试环境”“开发环境”等标记。
- **自定义规则**：支持配置名称、URL 匹配规则、颜色、透明度、字体大小和默认显示位置。
- **支持正则匹配**：URL 匹配字段支持正则表达式；如果正则无效，会自动按普通包含匹配处理。
- **自由拖拽**：页面标记支持拖动，可放到不遮挡操作的位置。
- **记住拖拽位置**：拖动后会自动保存位置，下次打开命中同一条规则的页面时会恢复到上次位置。
- **单页应用适配**：支持监听前端路由变化，页面 URL 变化后会自动重新判断环境标记。
- **规则测试**：配置页内可以输入 URL 测试命中哪条规则。
- **导入/导出配置**：支持导出 JSON 配置，也支持从本地 JSON 文件导入配置。

### 安装方式

1. 下载或克隆本仓库。
2. 打开 Chrome，进入 `chrome://extensions/`。
3. 打开右上角“开发者模式”。
4. 点击“加载已解压的扩展程序”。
5. 选择目录：`browser_extension/Env_Guard`。

### 配置说明

安装后，在 Chrome 扩展管理页打开 Env Guard 的“扩展程序选项”，即可配置标记规则。

每条规则包含：

- **启用**：是否启用该规则。
- **名称**：页面上显示的环境名称。
- **URL 匹配**：用于匹配页面 URL，支持正则表达式。
- **颜色**：标记背景颜色。
- **透明度**：标记背景透明度。
- **默认位置**：标记首次显示的位置。
- **字体大小**：标记文字大小。

新安装时会提供通用示例规则，例如：

- `https://www.example.com/`
- `https://test.example.com/`
- `localhost|127.0.0.1|dev.example.com`

你可以根据自己的项目地址进行修改。

## English

### Features

- **Environment marker**: Displays labels such as Production, Test, or Development based on URL rules.
- **Custom rules**: Configure label name, URL pattern, color, opacity, font size, and default position.
- **Regex support**: URL patterns support regular expressions. If a pattern is not a valid regex, Env Guard falls back to simple substring matching.
- **Draggable marker**: Move the marker to a convenient position on the page.
- **Remembered position**: The extension remembers the last dragged position for each matched rule.
- **SPA-friendly updates**: Detects URL changes in single-page applications and refreshes the marker automatically.
- **Rule tester**: Test a URL in the options page to see which rule it matches.
- **Import and export**: Export configuration as JSON and import configuration from a local JSON file.

### Installation

1. Download or clone this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable “Developer mode”.
4. Click “Load unpacked”.
5. Select the directory: `browser_extension/Env_Guard`.

### Configuration

After installation, open the Env Guard options page from Chrome extension management.

Each rule contains:

- **Enabled**: Whether the rule is active.
- **Name**: The environment label displayed on the page.
- **URL pattern**: The URL matching rule, with regex support.
- **Color**: Marker background color.
- **Opacity**: Marker background opacity.
- **Default position**: Initial marker position on the page.
- **Font size**: Marker text size.

New installations include generic example rules such as:

- `https://www.example.com/`
- `https://test.example.com/`
- `localhost|127.0.0.1|dev.example.com`

Update these examples to match your own project environments.

## License

Copyright (c) 2026 Linlei-dev. All rights reserved.

This project is proprietary software. Without prior written permission from the copyright holder, no individual or organization may copy, modify, distribute, publish, sublicense, sell, or use this project for commercial purposes.

## 版权声明

版权所有 (c) 2026 Linlei-dev。保留所有权利。

本项目为专有软件。未经版权持有人事先书面许可，任何个人或组织不得复制、修改、分发、发布、再授权、销售本项目，或将本项目用于商业用途。
