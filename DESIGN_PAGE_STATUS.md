# /design 页面现状文档

## 概述

`/design` 是设计课程（设计面试评估）的主流程页面。该页面实现了多步骤设计问题评估流程，用户需要完整回答所有设计问题后，再在最终总结页面查看完整评分和反馈。

## 工作流程

### 第 1 步：背景评价（Background Evaluation）
- **URL**: `/design` (初始状态)
- **组件**: `BackgroundForm`
- **收集的信息**:
  - 面谈日期（必填）
  - 被面试者 EID（必填）
  - 面试者 EID（必填）
  - 部署（可选）
  - 基础设计经验（1年未満/1-3年/3年以上）
  - 需求定义经验（1年未満/1年以上）
  - 设计评审经验（1年未満/1年以上）
- **输出**: `BackgroundData` 对象 + 背景得分（background_score）

### 第 2 步：设计领域选择（Design Domain Selection）
- **组件**: `DomainSelector`
- **操作**: 用户选择要评估的设计领域（可多选）
- **后端调用**: `POST /api/design/sessions`
  - 创建新的 design_sessions 记录
  - 返回 session_id 和该领域的问题列表

### 第 3 步：面试问题回答（Interview with Scoring）
- **流程**: 逐题回答 → **立即评分** → 显示评价 → 进入下一题

#### 子步骤 3a：问题展示
- **组件**: `DesignQuestionCard`
- **显示**: 问题编号、分类、难度、问题内容

#### 子步骤 3b：用户回答
- **组件**: `DesignAnswerInput`
- **操作**:
  - 用户输入回答文本（语音输入或文本）
  - 可选：跳过问题（得分 0）

#### 子步骤 3c：AI 评分（**每题立即评分**）
- **后端调用**: `POST /api/design/evaluate`
- **评分维度**:
  - score（总分）
  - accuracy（正確性）
  - completeness（網羅性）
  - clarity（明瞭性）
  - terminology（專門用語）
  - feedback（AI 反馈文本）

#### 子步骤 3d：评分结果显示
- **组件**: `DesignResultCard`
- **显示内容**:
  - ✓ 问题（质問）
  - ✓ 用户回答（あなたの回答）
  - ✓ AI 反馈（AIフィードバック）
  - **隐藏**: 四维度评分详情不在此显示
- **按钮**:
  - "次の問題へ" / "戻る"（返回上题）/ "完了"（完成）

### 第 4 步：总结与反馈（Summary）
- **组件**: `DesignSummary`
- **显示内容**:
  - Pレベル（P-Level 评级）及等级说明
  - 背景得分 + 技术得分 = 总分
  - **完整答题列表**，包含：
    - Q编号 + 分类
    - **四维度评分详情**（正確性、網羅性、明瞭性、專門用語）
    - 用户回答
    - AI 反馈
  - 总合反馈（由 AI 生成的总体评价）
  - PDF 报告生成按钮
  - 重新开始按钮

## 数据流关键点

### 答题流程中的数据隐藏策略
1. **在 DesignResultCard 中**（个别答题后）：
   - ✗ 隐藏四维度评分（accuracy/completeness/clarity/terminology）
   - ✓ 显示 AI 反馈文本
   - 目的：避免在答题过程中给用户过多评分焦虑

2. **在 DesignSummary 中**（最终总结）：
   - ✓ 显示四维度评分详情
   - ✓ 显示每题总分
   - ✓ 显示 P-Level 和总分
   - 目的：提供完整反馈和评估结果

### 反馈功能
- **位置**: 页面右上角 💬 按钮（仅在 sessionId 存在且不在 background/domain/summary 步骤时显示）
- **组件**: `FeedbackModal`
- **功能**: 用户可在评分过程中随时提交反馈
  - 1-5 星评分
  - 反馈类型（建議/問題/表賛/その他）
  - 自由文本评论
- **后端**: `POST /api/design/feedback`

## 关键文件结构

```
src/app/design/
└── page.tsx                    # 主流程页面（所有步骤管理）

src/components/design/
├── BackgroundForm.tsx          # 背景评价表单
├── DomainSelector.tsx          # 设计领域选择器
├── DesignQuestionCard.tsx      # 问题展示卡片
├── DesignAnswerInput.tsx       # 回答输入（含语音）
├── DesignResultCard.tsx        # 单题评分结果（隐藏评分详情）
├── DesignSummary.tsx           # 最终总结（显示完整评分）
└── FeedbackModal.tsx           # 反馈弹窗

src/app/api/design/
├── sessions/route.ts           # 创建/更新 session
├── evaluate/route.ts           # AI 评分和总合反馈
└── feedback/route.ts           # 反馈管理
```

## 状态流程图

```
背景評価 → 設計領域選択 → 問題1 → 回答1 → AI評点 → 結果1
                                              ↓
                                          問題2 → 回答2 → AI評点 → 結果2
                                                                ↓
                                                            （更多問題）
                                                                ↓
                                                           總合評価（Summary）
                                                                ↓
                                                           P-Level + PDF報告
```

## 与 /interview 页面的对比

| 功能 | /design | /interview |
|------|---------|-----------|
| 评分时机 | 每题立即评分 | ~~批量评分~~ → 改为每题立即评分 |
| 评分详情显示 | 隐藏在答题流程 → 显示在总结页面 | 每题后显示 |
| 反馈功能 | 💬 模态反馈 | 无（纯评分） |
| 问题来源 | 按选定领域筛选 | 随机生成 |
| 会话管理 | 创建 session 记录 | 纯临时会话 |

## 最近更新

- **2026-04-10**: 
  - `/interview` 页面改为每题后显示评分和反馈（与 `/design` 风格统一）
  - `/design` 页面保持现有设计：答题流程隐藏四维度评分详情，仅显示在最终总结
