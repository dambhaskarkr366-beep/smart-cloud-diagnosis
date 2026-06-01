-- ============================================================
-- 校园二手市场微信小程序 — 数据库建表脚本
-- 目标数据库：MySQL 8.0+
-- 字符集：utf8mb4（兼容 emoji）
-- 引擎：InnoDB
-- ============================================================

CREATE DATABASE IF NOT EXISTS `campus_market`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `campus_market`;

-- ============================================================
-- 1. 用户表
-- ============================================================
CREATE TABLE `users` (
  `id`                 BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT  COMMENT '用户ID',
  `openid`             VARCHAR(64)      NOT NULL                 COMMENT '微信 openid',
  `unionid`            VARCHAR(64)      DEFAULT NULL             COMMENT '微信 unionid（跨应用关联）',
  `nickname`           VARCHAR(64)      DEFAULT NULL             COMMENT '昵称',
  `avatar`             VARCHAR(512)     DEFAULT NULL             COMMENT '头像 URL',
  `phone`              VARCHAR(20)      DEFAULT NULL             COMMENT '手机号',
  `student_id`         VARCHAR(32)      DEFAULT NULL             COMMENT '学号',
  `real_name`          VARCHAR(32)      DEFAULT NULL             COMMENT '真实姓名',
  `campus`             VARCHAR(64)      DEFAULT NULL             COMMENT '校区',
  `dorm_area`          VARCHAR(128)     DEFAULT NULL             COMMENT '宿舍区域',
  `certification_status` ENUM('unverified','pending','verified','rejected')
                                        NOT NULL DEFAULT 'unverified' COMMENT '认证状态',
  `certification_image` VARCHAR(512)    DEFAULT NULL             COMMENT '学生证/认证材料图片 URL',
  `rating_avg`         DECIMAL(2,1)     NOT NULL DEFAULT 0.0     COMMENT '评价平均分（1.0-5.0）',
  `review_count`       INT UNSIGNED     NOT NULL DEFAULT 0       COMMENT '被评价次数',
  `response_time_avg`  INT UNSIGNED     NOT NULL DEFAULT 0       COMMENT '平均回复时长（分钟）',
  `role`               ENUM('user','admin')
                                        NOT NULL DEFAULT 'user'  COMMENT '角色',
  `status`             ENUM('active','disabled')
                                        NOT NULL DEFAULT 'active' COMMENT '账号状态',
  `created_at`         DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `updated_at`         DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_openid` (`openid`),
  INDEX `idx_phone` (`phone`),
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_campus` (`campus`),
  INDEX `idx_certification_status` (`certification_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';


-- ============================================================
-- 2. 商品分类表（树形结构）
-- ============================================================
CREATE TABLE `categories` (
  `id`          INT UNSIGNED     NOT NULL AUTO_INCREMENT  COMMENT '分类ID',
  `name`        VARCHAR(32)      NOT NULL                 COMMENT '分类名称',
  `icon`        VARCHAR(256)     DEFAULT NULL             COMMENT '图标 URL 或图标名称',
  `parent_id`   INT UNSIGNED     DEFAULT NULL             COMMENT '父分类ID（NULL=一级分类）',
  `sort_order`  INT              NOT NULL DEFAULT 0       COMMENT '排序权重（越大越靠前）',
  `status`      ENUM('active','disabled')
                                 NOT NULL DEFAULT 'active' COMMENT '状态',
  `created_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_sort` (`parent_id`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表（树形）';


-- ============================================================
-- 3. 商品表
-- ============================================================
CREATE TABLE `products` (
  `id`              BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '商品ID',
  `seller_id`       BIGINT UNSIGNED   NOT NULL                 COMMENT '卖家用户ID',
  `title`           VARCHAR(120)      NOT NULL                 COMMENT '标题（≤60字，但留buffer）',
  `description`     TEXT              DEFAULT NULL             COMMENT '商品描述（≤500字）',
  `price`           DECIMAL(10,2)     NOT NULL                 COMMENT '售价（0=免费送）',
  `original_price`  DECIMAL(10,2)     DEFAULT NULL             COMMENT '原价（划线对比）',
  `category_id`     INT UNSIGNED      DEFAULT NULL             COMMENT '分类ID',
  `condition`       ENUM('new','like_new','slightly_used','used')
                                      NOT NULL                 COMMENT '成色：全新/几乎全新/少量使用痕迹/明显使用痕迹',
  `meet_location`   VARCHAR(256)      NOT NULL                 COMMENT '面交地点',
  `tags`            VARCHAR(256)      DEFAULT NULL             COMMENT '自定义标签（逗号分隔）',
  `status`          ENUM('on_sale','reserved','sold','draft','deleted')
                                      NOT NULL DEFAULT 'on_sale' COMMENT '商品状态',
  `view_count`      INT UNSIGNED      NOT NULL DEFAULT 0       COMMENT '浏览量',
  `fav_count`       INT UNSIGNED      NOT NULL DEFAULT 0       COMMENT '收藏数',
  `is_free`         TINYINT(1)        NOT NULL DEFAULT 0       COMMENT '是否免费送',
  `created_at`      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  `updated_at`      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_seller_id` (`seller_id`),
  INDEX `idx_category_id` (`category_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_price` (`price`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_status_created` (`status`, `created_at`),
  INDEX `idx_category_status` (`category_id`, `status`),
  FULLTEXT INDEX `ft_title_desc` (`title`, `description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';


-- ============================================================
-- 4. 商品图片表
-- ============================================================
CREATE TABLE `product_images` (
  `id`          BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '图片ID',
  `product_id`  BIGINT UNSIGNED   NOT NULL                 COMMENT '商品ID',
  `url`         VARCHAR(512)      NOT NULL                 COMMENT '图片 URL',
  `sort_order`  TINYINT UNSIGNED  NOT NULL DEFAULT 0       COMMENT '排序（0=主图）',
  `created_at`  DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  PRIMARY KEY (`id`),
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_product_sort` (`product_id`, `sort_order`),
  CONSTRAINT `fk_images_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品图片表';


-- ============================================================
-- 5. 收藏表
-- ============================================================
CREATE TABLE `favorites` (
  `id`          BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '收藏ID',
  `user_id`     BIGINT UNSIGNED   NOT NULL                 COMMENT '用户ID',
  `product_id`  BIGINT UNSIGNED   NOT NULL                 COMMENT '商品ID',
  `created_at`  DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_user_product` (`user_id`, `product_id`),
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';


-- ============================================================
-- 6. 浏览历史表
-- ============================================================
CREATE TABLE `browse_history` (
  `id`          BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '记录ID',
  `user_id`     BIGINT UNSIGNED   NOT NULL                 COMMENT '用户ID',
  `product_id`  BIGINT UNSIGNED   NOT NULL                 COMMENT '商品ID',
  `created_at`  DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '浏览时间',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_user_product` (`user_id`, `product_id`),
  INDEX `idx_user_created` (`user_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='浏览历史表';

-- 浏览历史使用 INSERT ... ON DUPLICATE KEY UPDATE created_at = NOW()
-- 自动去重 + 更新时间，每个用户对同一商品只保留最新一条


-- ============================================================
-- 7. 会话表（IM 会话）
-- ============================================================
CREATE TABLE `conversations` (
  `id`              BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '会话ID',
  `buyer_id`        BIGINT UNSIGNED   NOT NULL                 COMMENT '买家用户ID',
  `seller_id`       BIGINT UNSIGNED   NOT NULL                 COMMENT '卖家用户ID',
  `product_id`      BIGINT UNSIGNED   NOT NULL                 COMMENT '关联商品ID',
  `last_message`    VARCHAR(500)      DEFAULT NULL             COMMENT '最后一条消息预览',
  `last_message_at` DATETIME          DEFAULT NULL             COMMENT '最后消息时间',
  `buyer_unread`    INT UNSIGNED      NOT NULL DEFAULT 0       COMMENT '买家未读数',
  `seller_unread`   INT UNSIGNED      NOT NULL DEFAULT 0       COMMENT '卖家未读数',
  `status`          ENUM('active','closed')
                                      NOT NULL DEFAULT 'active' COMMENT '会话状态',
  `created_at`      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_buyer_seller_product` (`buyer_id`, `seller_id`, `product_id`),
  INDEX `idx_buyer_id` (`buyer_id`),
  INDEX `idx_seller_id` (`seller_id`),
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_last_message_at` (`last_message_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='IM 会话表';


-- ============================================================
-- 8. 消息表（IM 消息）
-- ============================================================
CREATE TABLE `messages` (
  `id`              BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '消息ID',
  `conversation_id` BIGINT UNSIGNED   NOT NULL                 COMMENT '会话ID',
  `sender_id`       BIGINT UNSIGNED   NOT NULL                 COMMENT '发送者用户ID',
  `type`            ENUM('text','image','product_card','system')
                                      NOT NULL                 COMMENT '消息类型',
  `content`         TEXT              NOT NULL                 COMMENT '消息内容',
  `is_read`         TINYINT(1)        NOT NULL DEFAULT 0       COMMENT '是否已读',
  `created_at`      DATETIME(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '发送时间（毫秒精度）',
  PRIMARY KEY (`id`),
  INDEX `idx_conversation_created` (`conversation_id`, `created_at`),
  INDEX `idx_sender_id` (`sender_id`),
  CONSTRAINT `fk_messages_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='IM 消息表';


-- ============================================================
-- 9. 订单表
-- ============================================================
CREATE TABLE `orders` (
  `id`              BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '订单ID',
  `buyer_id`        BIGINT UNSIGNED   NOT NULL                 COMMENT '买家用户ID',
  `seller_id`       BIGINT UNSIGNED   NOT NULL                 COMMENT '卖家用户ID',
  `product_id`      BIGINT UNSIGNED   NOT NULL                 COMMENT '商品ID',
  `conversation_id` BIGINT UNSIGNED   DEFAULT NULL             COMMENT '关联会话ID',
  `status`          ENUM('pending','confirmed','completed','cancelled')
                                      NOT NULL DEFAULT 'pending' COMMENT '订单状态',
  `meet_time`       DATETIME          DEFAULT NULL             COMMENT '约定面交时间',
  `meet_location`   VARCHAR(256)      DEFAULT NULL             COMMENT '约定面交地点',
  `buyer_confirmed` TINYINT(1)        NOT NULL DEFAULT 0       COMMENT '买家是否确认完成',
  `seller_confirmed` TINYINT(1)       NOT NULL DEFAULT 0       COMMENT '卖家是否确认完成',
  `cancelled_by`    ENUM('buyer','seller','system')
                                      DEFAULT NULL             COMMENT '取消方',
  `cancel_reason`   VARCHAR(256)      DEFAULT NULL             COMMENT '取消原因',
  `buyer_reviewed`  TINYINT(1)        NOT NULL DEFAULT 0       COMMENT '买家是否已评价',
  `seller_reviewed` TINYINT(1)        NOT NULL DEFAULT 0       COMMENT '卖家是否已评价',
  `completed_at`    DATETIME          DEFAULT NULL             COMMENT '完成时间',
  `created_at`      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_buyer_id` (`buyer_id`),
  INDEX `idx_seller_id` (`seller_id`),
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_buyer_status` (`buyer_id`, `status`),
  INDEX `idx_seller_status` (`seller_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- 注意：校园版不涉及线上支付，订单是「意向确认 + 面交履约」的轻量流程
-- completed_at 在 buyer_confirmed=1 AND seller_confirmed=1 时写入


-- ============================================================
-- 10. 评价表
-- ============================================================
CREATE TABLE `reviews` (
  `id`                BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '评价ID',
  `order_id`          BIGINT UNSIGNED   NOT NULL                 COMMENT '关联订单ID',
  `reviewer_id`       BIGINT UNSIGNED   NOT NULL                 COMMENT '评价者用户ID',
  `reviewee_id`       BIGINT UNSIGNED   NOT NULL                 COMMENT '被评价者用户ID',
  `rating_response`   TINYINT UNSIGNED  NOT NULL                 COMMENT '响应速度评分（1-5）',
  `rating_accuracy`   TINYINT UNSIGNED  NOT NULL                 COMMENT '物品与描述一致评分（1-5）',
  `rating_overall`    TINYINT UNSIGNED  NOT NULL                 COMMENT '整体体验评分（1-5）',
  `content`           VARCHAR(500)      DEFAULT NULL             COMMENT '文字评价（≤200字，留buffer）',
  `created_at`        DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '评价时间',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_order_reviewer` (`order_id`, `reviewer_id`),
  INDEX `idx_reviewee_id` (`reviewee_id`),
  INDEX `idx_created_at` (`created_at`),
  CONSTRAINT `fk_reviews_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价表';

-- 互评逻辑：交易完成后双方各自提交评价，双方都提交后评价才互相可见
-- 查询某用户收到的评价：SELECT * FROM reviews WHERE reviewee_id = ?


-- ============================================================
-- 11. 举报表
-- ============================================================
CREATE TABLE `reports` (
  `id`            BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '举报ID',
  `reporter_id`   BIGINT UNSIGNED   NOT NULL                 COMMENT '举报者用户ID',
  `target_type`   ENUM('product','user')
                                    NOT NULL                 COMMENT '举报对象类型',
  `target_id`     BIGINT UNSIGNED   NOT NULL                 COMMENT '举报对象ID',
  `reason`        VARCHAR(256)      NOT NULL                 COMMENT '举报原因',
  `description`   TEXT              DEFAULT NULL             COMMENT '补充说明',
  `status`        ENUM('pending','reviewed','resolved','dismissed')
                                    NOT NULL DEFAULT 'pending' COMMENT '处理状态',
  `handler_note`  VARCHAR(512)      DEFAULT NULL             COMMENT '管理员处理备注',
  `created_at`    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '举报时间',
  `updated_at`    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '处理时间',
  PRIMARY KEY (`id`),
  INDEX `idx_reporter_id` (`reporter_id`),
  INDEX `idx_target` (`target_type`, `target_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='举报表';


-- ============================================================
-- 12. 用户黑名单表
-- ============================================================
CREATE TABLE `blocks` (
  `id`          BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '拉黑记录ID',
  `blocker_id`  BIGINT UNSIGNED   NOT NULL                 COMMENT '拉黑者用户ID（谁操作的拉黑）',
  `blocked_id`  BIGINT UNSIGNED   NOT NULL                 COMMENT '被拉黑者用户ID',
  `created_at`  DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '拉黑时间',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_blocker_blocked` (`blocker_id`, `blocked_id`),
  INDEX `idx_blocked_id` (`blocked_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户黑名单表';

-- 拉黑后效果：双方无法互发消息，blocker 看不到 blocked 的商品


-- ============================================================
-- 13. 首页 Banner 表
-- ============================================================
CREATE TABLE `banners` (
  `id`          INT UNSIGNED      NOT NULL AUTO_INCREMENT  COMMENT 'Banner ID',
  `title`       VARCHAR(64)       NOT NULL                 COMMENT '标题',
  `image_url`   VARCHAR(512)      NOT NULL                 COMMENT '图片 URL',
  `link_type`   ENUM('product','category','url','none')
                                  NOT NULL DEFAULT 'none'  COMMENT '跳转类型',
  `link_target` VARCHAR(256)      DEFAULT NULL             COMMENT '跳转目标（商品ID/分类ID/外部URL）',
  `sort_order`  INT               NOT NULL DEFAULT 0       COMMENT '排序权重',
  `status`      ENUM('active','disabled')
                                  NOT NULL DEFAULT 'active' COMMENT '状态',
  `start_at`    DATETIME          DEFAULT NULL             COMMENT '展示开始时间',
  `end_at`      DATETIME          DEFAULT NULL             COMMENT '展示结束时间',
  `created_at`  DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  INDEX `idx_status_sort` (`status`, `sort_order`),
  INDEX `idx_time_range` (`start_at`, `end_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='首页 Banner 表';


-- ============================================================
-- 初始化分类数据
-- ============================================================
INSERT INTO `categories` (`id`, `name`, `parent_id`, `sort_order`) VALUES
-- 一级分类
(1,  '教材教辅', NULL, 10),
(2,  '数码电子', NULL, 20),
(3,  '美妆护肤', NULL, 30),
(4,  '服饰鞋包', NULL, 40),
(5,  '生活日用', NULL, 50),
(6,  '运动户外', NULL, 60),
(7,  '零食饮料', NULL, 70),
(8,  '其他闲置', NULL, 80),

-- 二级分类：教材教辅
(11, '公共课教材',   1, 10),
(12, '专业课教材',   1, 20),
(13, '考研资料',     1, 30),
(14, '考公/考证',    1, 40),
(15, '课外读物',     1, 50),

-- 二级分类：数码电子
(21, '手机/平板',    2, 10),
(22, '电脑/笔记本',  2, 20),
(23, '耳机/音箱',    2, 30),
(24, '相机/镜头',    2, 40),
(25, '智能穿戴',     2, 50),
(26, '配件/线材',    2, 60),

-- 二级分类：美妆护肤
(31, '面部护理',     3, 10),
(32, '彩妆',         3, 20),
(33, '香水',         3, 30),
(34, '身体护理',     3, 40),

-- 二级分类：服饰鞋包
(41, '男装',         4, 10),
(42, '女装',         4, 20),
(43, '鞋靴',         4, 30),
(44, '箱包',         4, 40),
(45, '配饰',         4, 50),

-- 二级分类：生活日用
(51, '宿舍收纳',     5, 10),
(52, '台灯/照明',    5, 20),
(53, '床上用品',     5, 30),
(54, '清洁用品',     5, 40),
(55, '小家电',       5, 50),
(56, '文具/工具',    5, 60),

-- 二级分类：运动户外
(61, '球类/球拍',    6, 10),
(62, '健身器材',     6, 20),
(63, '骑行/滑板',    6, 30),
(64, '户外装备',     6, 40);
