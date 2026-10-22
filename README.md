# Head Hunters — Applicant Insights / Demi's report prototype

## 打开方式

解压整个文件夹，双击 `index.html`，用 Chrome / Safari / Edge 打开。报告不需要安装软件、启动服务器或联网。

- `index.html`：直接打开招聘者报告，适合课堂展示。
- `applicant.html`：从组员原来的职位选择、简历上传界面开始。点击 Continue to recruiter report 会跳过 AI pre-view 面试，进入对应岗位的报告。
- 原有的 PDF 简历读取和字体仍然使用在线资源；没有网络时可以粘贴简历文字。

## 报告交互

1. 每个柱状图包含这个岗位的 8 位示例申请者，分别从高到低排序。
2. 点击任意柱子或颜色图例，选中申请者。页面下方的个人信息和五张雷达图立即更新。
3. 点击浮动的 View radar profile，跳到个人详情。
4. Technical / People & thinking 可以筛选显示的指标；All competencies 恢复八张图。
5. Execution & ownership 展示独立交付与优先级两个排名指标；没有单独的 Learning & adaptability 分区。
6. Show pool average 控制雷达图的平均值虚线。
7. 个人资料栏提供下拉选择和上一位 / 下一位切换。
8. Export scores 下载所有申请者的八项示例分数 CSV。
9. Job position 可以切换 AI Software Engineer / Senior Frontend Engineer / Data Engineer，技术指标随之改变。

## 五类雷达图

- 技术能力：Java、Python、AI 模型理解、系统设计、测试（默认 AI 岗位）。
- 工作风格：主动性、适应性、责任感、学习动力、组织能力。
- 团队协作：接受反馈、知识分享、处理分歧、可靠性、团队目标一致性。
- 沟通与问题解决：表达清晰、结构化思考、权衡方案、主动倾听、理解需求。
- 执行与责任：独立交付、任务优先级、持续跟进、质量判断、进度沟通。

不同申请者有不同分数、工作特点和示例说明。为保持可比较性，同一岗位的雷达图维度保持一致。工作风格是工作场景中的示例行为，不是医学或心理诊断。

## 示例数据与范围

这是三个报告方案中的一种交互原型，不包含真实 AI 面试或真实候选人评分。8 位申请者、评分、工作经历和面试记录均为虚构。各岗位复用同一组确定的数字模板，并切换技术标签与示例说明，仅用于展示报告交互。上传的简历不被保存、评估或加入这些示例分数。没有后台、账户、数据库或自动招聘决策。

Java / Python / AI 三项分数对应技术雷达图的前三个维度；工作风格、团队协作、沟通与问题解决的柱状图分数，分别是对应雷达图五个维度的四舍五入平均分。新增的独立交付与优先级两个排名指标，对应执行与责任雷达图的前两个维度。

## 组员对接

- `report-data.js`：所有示例申请者、评分、个人说明、雷达图维度及岗位配置。
- `interview-evidence.js`：三个岗位、八位申请者的具体面试示例。每人两张卡片包括提问、背景、本人贡献、具体结果与范围，以及可展开的后续核实问题。所有案例与数字均为虚构。
- `report.js`：排序柱状图、点击切换、SVG 雷达图和 CSV 导出。
- `report.css`：仅用于报告的样式，与原来的 `styles.css` 分开。
- `applicant.html`、`app.js`、`styles.css`、`interview.js`：基于组员提供的文件。保留原来的两个岗位，并增加 AI Software Engineer；简历提交后跳转报告。原模拟面试代码保留，但当前流程不调用。
- 报告入口：`index.html?role=ai`，也支持 `role=fe` / `role=de`；`candidate=priya` 等参数可以指定默认申请者。

展示前建议先打开报告，点击 Priya Shah 的 Python 或 AI 柱状条，再切换到 Jordan Lee 的团队协作柱状条，说明“整体排名 → 个人能力画像 → 具体面试依据”的流程。
