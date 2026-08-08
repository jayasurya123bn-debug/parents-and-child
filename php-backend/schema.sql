-- ============================================================
--  ArtBloom — MySQL Schema
--  Run this in phpMyAdmin on ProFreeHost after creating your DB
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET sql_mode = '';

-- ── users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`                   INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `first_name`           VARCHAR(50)     NOT NULL,
  `last_name`            VARCHAR(50)     NOT NULL,
  `username`             VARCHAR(30)     NOT NULL,
  `email`                VARCHAR(191)    NOT NULL,
  `password`             VARCHAR(255)    NOT NULL,
  `role`                 ENUM('parent','admin') NOT NULL DEFAULT 'parent',
  `account_status`       ENUM('active','suspended','pending_verification','deactivated') NOT NULL DEFAULT 'active',
  `suspension_reason`    TEXT            DEFAULT NULL,
  `suspension_end_date`  DATETIME        DEFAULT NULL,
  `avatar_url`           VARCHAR(500)    NOT NULL DEFAULT 'https://res.cloudinary.com/demo/image/upload/v1/art-showcase/avatars/default.png',
  `avatar_public_id`     VARCHAR(255)    DEFAULT NULL,
  `bio`                  VARCHAR(300)    NOT NULL DEFAULT '',
  `location`             VARCHAR(100)    NOT NULL DEFAULT '',
  `website`              VARCHAR(255)    NOT NULL DEFAULT '',
  `total_likes_given`    INT UNSIGNED    NOT NULL DEFAULT 0,
  `total_comments_given` INT UNSIGNED    NOT NULL DEFAULT 0,
  `forum_post_count`     INT UNSIGNED    NOT NULL DEFAULT 0,
  `email_verified`       TINYINT(1)      NOT NULL DEFAULT 0,
  `last_login`           DATETIME        DEFAULT NULL,
  `login_attempts`       TINYINT         NOT NULL DEFAULT 0,
  `lock_until`           DATETIME        DEFAULT NULL,
  `notif_email_comment`  TINYINT(1)      NOT NULL DEFAULT 1,
  `notif_email_like`     TINYINT(1)      NOT NULL DEFAULT 0,
  `notif_email_forum`    TINYINT(1)      NOT NULL DEFAULT 1,
  `theme`                ENUM('light','dark','system') NOT NULL DEFAULT 'system',
  `created_at`           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_email`    (`email`),
  UNIQUE KEY `uq_username` (`username`),
  KEY `idx_role_status`    (`role`, `account_status`),
  KEY `idx_created_at`     (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── children ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `children` (
  `id`              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `parent_id`       INT UNSIGNED  NOT NULL,
  `display_name`    VARCHAR(40)   NOT NULL,
  `date_of_birth`   DATE          NOT NULL,
  `age_group`       ENUM('toddler','early_childhood','middle_childhood','tween') DEFAULT NULL,
  `avatar_url`      VARCHAR(500)  NOT NULL DEFAULT 'https://res.cloudinary.com/demo/image/upload/v1/art-showcase/avatars/child_default.png',
  `avatar_public_id` VARCHAR(255)  DEFAULT NULL,
  `bio`             VARCHAR(200)  NOT NULL DEFAULT '',
  `art_interests`   TEXT          DEFAULT NULL COMMENT 'JSON array of interests',
  `favorite_colors` TEXT          DEFAULT NULL COMMENT 'JSON array',
  `privacy_level`   ENUM('public','community','private') NOT NULL DEFAULT 'community',
  `total_uploads`   INT UNSIGNED  NOT NULL DEFAULT 0,
  `total_likes`     INT UNSIGNED  NOT NULL DEFAULT 0,
  `total_comments`  INT UNSIGNED  NOT NULL DEFAULT 0,
  `featured_count`  INT UNSIGNED  NOT NULL DEFAULT 0,
  `consent_given`   TINYINT(1)    NOT NULL DEFAULT 0,
  `consent_date`    DATETIME      DEFAULT NULL,
  `is_active`       TINYINT(1)    NOT NULL DEFAULT 1,
  `deactivated_at`  DATETIME      DEFAULT NULL,
  `created_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_parent`    (`parent_id`),
  KEY `idx_age_group` (`age_group`),
  CONSTRAINT `fk_child_parent` FOREIGN KEY (`parent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── artworks ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `artworks` (
  `id`                  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `child_id`            INT UNSIGNED  NOT NULL,
  `parent_id`           INT UNSIGNED  NOT NULL,
  `title`               VARCHAR(100)  NOT NULL,
  `description`         VARCHAR(500)  NOT NULL DEFAULT '',
  `category`            ENUM('painting','drawing','craft','sculpture','digital','mixed_media','photography','other') NOT NULL,
  `medium`              VARCHAR(80)   NOT NULL DEFAULT '',
  `tags`                TEXT          DEFAULT NULL COMMENT 'JSON array',
  `image_original_url`  VARCHAR(500)  NOT NULL,
  `image_original_pid`  VARCHAR(255)  NOT NULL,
  `image_medium_url`    VARCHAR(500)  DEFAULT NULL,
  `image_thumb_url`     VARCHAR(500)  DEFAULT NULL,
  `moderation_status`   ENUM('pending','approved','rejected','flagged') NOT NULL DEFAULT 'pending',
  `moderation_notes`    TEXT          NOT NULL DEFAULT '',
  `moderated_by`        INT UNSIGNED  DEFAULT NULL,
  `moderated_at`        DATETIME      DEFAULT NULL,
  `like_count`          INT UNSIGNED  NOT NULL DEFAULT 0,
  `view_count`          INT UNSIGNED  NOT NULL DEFAULT 0,
  `share_count`         INT UNSIGNED  NOT NULL DEFAULT 0,
  `report_count`        INT UNSIGNED  NOT NULL DEFAULT 0,
  `is_published`        TINYINT(1)    NOT NULL DEFAULT 0,
  `is_featured`         TINYINT(1)    NOT NULL DEFAULT 0,
  `featured_at`         DATETIME      DEFAULT NULL,
  `child_story`         VARCHAR(300)  NOT NULL DEFAULT '',
  `creation_date`       DATE          DEFAULT NULL,
  `created_at`          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_child_created`  (`child_id`, `created_at`),
  KEY `idx_parent`         (`parent_id`),
  KEY `idx_mod_status`     (`moderation_status`, `created_at`),
  KEY `idx_category_mod`   (`category`, `moderation_status`),
  KEY `idx_featured`       (`is_featured`, `featured_at`),
  CONSTRAINT `fk_artwork_child`  FOREIGN KEY (`child_id`)  REFERENCES `children` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_artwork_parent` FOREIGN KEY (`parent_id`) REFERENCES `users`    (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── artwork_likes ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `artwork_likes` (
  `artwork_id` INT UNSIGNED NOT NULL,
  `user_id`    INT UNSIGNED NOT NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`artwork_id`, `user_id`),
  CONSTRAINT `fk_like_artwork` FOREIGN KEY (`artwork_id`) REFERENCES `artworks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_like_user`    FOREIGN KEY (`user_id`)    REFERENCES `users`    (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── comments ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `comments` (
  `id`                 INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `artwork_id`         INT UNSIGNED  NOT NULL,
  `author_id`          INT UNSIGNED  NOT NULL,
  `parent_comment_id`  INT UNSIGNED  DEFAULT NULL,
  `text`               VARCHAR(500)  NOT NULL,
  `moderation_status`  ENUM('pending','approved','rejected','flagged') NOT NULL DEFAULT 'pending',
  `moderated_by`       INT UNSIGNED  DEFAULT NULL,
  `moderated_at`       DATETIME      DEFAULT NULL,
  `moderation_note`    VARCHAR(300)  NOT NULL DEFAULT '',
  `reaction_count`     INT UNSIGNED  NOT NULL DEFAULT 0,
  `report_count`       INT UNSIGNED  NOT NULL DEFAULT 0,
  `reply_count`        INT UNSIGNED  NOT NULL DEFAULT 0,
  `is_deleted`         TINYINT(1)    NOT NULL DEFAULT 0,
  `deleted_at`         DATETIME      DEFAULT NULL,
  `deleted_by`         INT UNSIGNED  DEFAULT NULL,
  `created_at`         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_artwork_created` (`artwork_id`, `created_at`),
  KEY `idx_author`          (`author_id`),
  KEY `idx_parent_comment`  (`parent_comment_id`),
  CONSTRAINT `fk_comment_artwork` FOREIGN KEY (`artwork_id`) REFERENCES `artworks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comment_author`  FOREIGN KEY (`author_id`)  REFERENCES `users`    (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── forum_posts ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `forum_posts` (
  `id`                 INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `author_id`          INT UNSIGNED  NOT NULL,
  `title`              VARCHAR(150)  NOT NULL,
  `body`               TEXT          NOT NULL,
  `category`           ENUM('tips_and_advice','art_techniques','child_development','materials_and_supplies','showcase_feedback','events_and_activities','general_discussion','announcements') NOT NULL,
  `tags`               TEXT          DEFAULT NULL COMMENT 'JSON array',
  `upvote_count`       INT UNSIGNED  NOT NULL DEFAULT 0,
  `view_count`         INT UNSIGNED  NOT NULL DEFAULT 0,
  `comment_count`      INT UNSIGNED  NOT NULL DEFAULT 0,
  `report_count`       INT UNSIGNED  NOT NULL DEFAULT 0,
  `is_pinned`          TINYINT(1)    NOT NULL DEFAULT 0,
  `is_announcement`    TINYINT(1)    NOT NULL DEFAULT 0,
  `is_closed`          TINYINT(1)    NOT NULL DEFAULT 0,
  `is_locked`          TINYINT(1)    NOT NULL DEFAULT 0,
  `moderation_status`  ENUM('pending','approved','rejected','flagged') NOT NULL DEFAULT 'approved',
  `moderated_by`       INT UNSIGNED  DEFAULT NULL,
  `moderated_at`       DATETIME      DEFAULT NULL,
  `is_deleted`         TINYINT(1)    NOT NULL DEFAULT 0,
  `deleted_at`         DATETIME      DEFAULT NULL,
  `last_activity_at`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at`         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_author_created`   (`author_id`, `created_at`),
  KEY `idx_category_mod`     (`category`, `moderation_status`, `created_at`),
  KEY `idx_pinned_activity`  (`is_pinned`, `last_activity_at`),
  CONSTRAINT `fk_fpost_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── forum_post_upvotes ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS `forum_post_upvotes` (
  `post_id`    INT UNSIGNED NOT NULL,
  `user_id`    INT UNSIGNED NOT NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`, `user_id`),
  CONSTRAINT `fk_upvote_post` FOREIGN KEY (`post_id`) REFERENCES `forum_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_upvote_user` FOREIGN KEY (`user_id`) REFERENCES `users`       (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── forum_comments ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `forum_comments` (
  `id`                 INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `post_id`            INT UNSIGNED  NOT NULL,
  `author_id`          INT UNSIGNED  NOT NULL,
  `parent_comment_id`  INT UNSIGNED  DEFAULT NULL,
  `text`               VARCHAR(1000) NOT NULL,
  `upvote_count`       INT UNSIGNED  NOT NULL DEFAULT 0,
  `reply_count`        INT UNSIGNED  NOT NULL DEFAULT 0,
  `report_count`       INT UNSIGNED  NOT NULL DEFAULT 0,
  `moderation_status`  ENUM('pending','approved','rejected','flagged') NOT NULL DEFAULT 'approved',
  `is_deleted`         TINYINT(1)    NOT NULL DEFAULT 0,
  `deleted_at`         DATETIME      DEFAULT NULL,
  `created_at`         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_post_created`    (`post_id`, `created_at`),
  KEY `idx_author`          (`author_id`),
  KEY `idx_parent_comment`  (`parent_comment_id`),
  CONSTRAINT `fk_fc_post`   FOREIGN KEY (`post_id`)   REFERENCES `forum_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fc_author` FOREIGN KEY (`author_id`) REFERENCES `users`       (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Default admin user (password: AdminPass@123) ─────────────
INSERT IGNORE INTO `users`
  (`first_name`,`last_name`,`username`,`email`,`password`,`role`,`account_status`,`email_verified`)
VALUES
  ('Admin','User','admin','admin@artshowcase.com',
   '$2y$12$wS8pLb4hS4XVdvQ/5KWoD.aHfqk2mZl3vNjBmwGimjmCb/T8EhiTO',
   'admin','active',1);

SET FOREIGN_KEY_CHECKS = 1;
