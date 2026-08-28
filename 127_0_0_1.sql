-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 24, 2026 at 11:31 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `baron_local_db`
--
CREATE DATABASE IF NOT EXISTS `baron_local_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `baron_local_db`;

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` varchar(36) NOT NULL,
  `username` text NOT NULL,
  `password` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bot_replies`
--

CREATE TABLE `bot_replies` (
  `id` int(11) NOT NULL,
  `project_id` varchar(36) DEFAULT NULL,
  `trigger_keyword` text NOT NULL,
  `reply_text` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `page_target` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bot_replies`
--

INSERT INTO `bot_replies` (`id`, `project_id`, `trigger_keyword`, `reply_text`, `created_at`, `is_active`, `page_target`) VALUES
(1, NULL, 'ءلا ئ', 'ر\\شبقي', '2026-08-16 22:04:15', 1, 'general');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` varchar(36) NOT NULL,
  `name` text NOT NULL,
  `phone` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `decorations`
--

CREATE TABLE `decorations` (
  `id` varchar(36) NOT NULL,
  `title` text NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `price` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `images`
--

CREATE TABLE `images` (
  `id` varchar(36) NOT NULL,
  `image_path` text NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `name` text NOT NULL,
  `phone` text DEFAULT NULL,
  `message` text NOT NULL,
  `reply` text DEFAULT NULL,
  `status` text DEFAULT NULL,
  `sender_type` text DEFAULT NULL,
  `content` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `created_at`, `name`, `phone`, `message`, `reply`, `status`, `sender_type`, `content`) VALUES
(2, '2026-08-18 22:49:15', 'أحمد التجريبي', '0539000000', 'مرحبا، أريد استفسار عن موديل GB-1', 'gb-1', NULL, 'admin', NULL),
(3, '2026-08-18 23:23:19', 'اختبار بارون', '0555555555', 'رسالة للجرس', NULL, NULL, NULL, NULL),
(5, '2026-08-19 00:50:33', 'سلشل', '2563759606', 'ابييس', NULL, NULL, NULL, NULL),
(6, '2026-08-19 00:53:16', 'yesir neccar', '2563759606', 'سلرؤ', NULL, NULL, NULL, NULL),
(8, '2026-08-19 19:43:50', 'ئئىئ', '47251413456432', '36363', NULL, NULL, NULL, NULL),
(9, '2026-08-19 19:55:24', 'faslk', '372626261', '222626161', NULL, NULL, NULL, NULL),
(10, '2026-08-19 19:59:31', 'yesir neccar', '5347586907', 'يتقغع474سرلش', 'مرحبا', NULL, 'admin', NULL),
(11, '2026-08-19 20:01:16', '312514ذ4', '15215252ف521', '26265256151514', NULL, NULL, NULL, NULL),
(13, '2026-08-19 20:06:02', '26252738459', '6526374859595', '63333737374375', NULL, NULL, NULL, NULL),
(14, '2026-08-19 20:09:39', '252633م', '4734747362', '47362524ى', NULL, NULL, NULL, NULL),
(15, '2026-08-19 20:10:26', '5235466خ970', '08086534634256', '6ف263ع54ه85ه5ع84غثلص', NULL, NULL, NULL, NULL),
(16, '2026-08-19 20:13:42', '252633ملا', '4734747362', 'فيس\\س', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` varchar(36) NOT NULL,
  `title` text NOT NULL,
  `content` text NOT NULL,
  `type` text DEFAULT NULL,
  `is_seen` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `title`, `content`, `type`, `is_seen`, `created_at`, `user_id`) VALUES
('18ea9fd8-49c8-47a5-9fd5-f823a2922562', 'مشروع جديد', 'dhjejwejw تمت إضافته للموقع', 'project', 1, '2026-08-19 19:30:55', '96fae7c3-2b99-462d-83e5-9551ca0bc0b0'),
('2309ca9c-5b51-410e-8902-f69944262566', 'رسالة جديدة', 'من سلشل: ابييس', 'message', 1, '2026-08-19 00:50:33', NULL),
('29f6f0b8-403f-4144-8a76-8aaf84ef448c', 'تم الرد على رسالة', 'تم إرسال رد الإدارة على رسالة الزائر', 'reply', 1, '2026-08-19 19:59:48', '10'),
('30eb212f-4279-42fe-bc36-58ac492c2508', 'رسالة جديدة', 'من yesir neccar: يتقغع474سرلش', 'message', 1, '2026-08-19 19:59:31', '10'),
('3677137f-9b66-11f1-a54f-74d02b02e0cb', 'إشعار تجريبي', 'هذا إشعار تجريبي لاختبار زر الجرس', 'system', 1, '2026-08-19 00:37:53', NULL),
('3faf953a-11e1-4d8d-b216-6e1bc827bbf1', 'تم تحديث مشروع', 'جبسم بورد تم تحديث بياناته', 'project', 1, '2026-08-19 19:29:09', '7448b072-d0ec-421c-bc7b-c6f42e532ae7'),
('460f7895-696f-490f-b7c8-8e4bbbae2c4c', 'رسالة جديدة', 'من 252633م: 47362524ى', 'message', 1, '2026-08-19 20:09:39', '14'),
('47b4d48d-8930-4e30-afa1-48c46539e5ec', 'رسالة جديدة', 'من ئئىئ: 36363', 'message', 1, '2026-08-19 19:43:50', '8'),
('481f5b48-6a7e-463b-b94e-70246ecaa147', 'رسالة جديدة', 'من 26252738459: 63333737374375', 'message', 1, '2026-08-19 20:06:02', '13'),
('4ce1b29f-3eab-4f11-925d-d0ea3b9a8916', 'رسالة جديدة', 'من faslk: 222626161', 'message', 1, '2026-08-19 19:55:24', '9'),
('75204b0a-2178-4f2e-a5fa-11f8b3306ec6', 'رسالة جديدة', 'من اختبار 3D: رسالة اختبار من نموذج صفحة 3D', 'message', 1, '2026-08-19 00:49:52', NULL),
('85533974-288b-415f-afdf-d882c7b6cd6f', 'رسالة جديدة', 'من اختبار الإشعار: اختبار فتح المحادثة من الجرس', 'message', 1, '2026-08-19 00:58:32', '7'),
('8b580a6f-80cf-4a68-8c5f-b4b85b27a244', 'رسالة جديدة', 'من 5235466خ970: 6ف263ع54ه85ه5ع84غثلص', 'message', 1, '2026-08-19 20:10:26', '15'),
('8e69d6a9-82e9-4b02-bc91-0163e98af9bd', 'مشروع جديد', 'اطفال تمت إضافته للموقع', 'project', 1, '2026-08-19 19:58:35', 'b362b053-a03c-463f-97a7-fc570e827eed'),
('91d22c3c-df02-4582-b922-f3470588c20c', 'رسالة جديدة', 'من 312514ذ4: 26265256151514', 'message', 1, '2026-08-19 20:01:16', '11'),
('976e6aed-788f-476d-9149-ec140e4235e0', 'مشروع جديد', 'ىياسس تمت إضافته للموقع', 'project', 1, '2026-08-19 20:27:36', '3a4d49d3-7e60-4fbf-b9fa-659493040fb7'),
('a6712fee-9d8d-4d51-9a8d-203fb9e10c65', 'رسالة جديدة', 'من اختبار الصفحة الرئيسية: اختبار حفظ الرسالة من النموذج', 'message', 1, '2026-08-19 20:04:26', '12'),
('b1242c5c-1c0a-4be8-92c2-c1722fb987b1', 'مشروع جديد', 'جبسم بورد تمت إضافته للموقع', 'project', 1, '2026-08-19 19:26:33', '7448b072-d0ec-421c-bc7b-c6f42e532ae7'),
('b7b29e10-38be-483b-8438-0f6c61a405ac', '????? ??????', '??? ????? ?????? ??????? ?? ?????', 'system', 1, '2026-08-19 00:34:07', NULL),
('b875805f-7ab0-45c2-8cd4-88bccf48fec8', 'تم تحديث مشروع', 'جبسم بورد تم تحديث بياناته', 'project', 1, '2026-08-19 19:29:07', '7448b072-d0ec-421c-bc7b-c6f42e532ae7'),
('bea59a13-9df2-4c67-81c9-7acdabff6def', 'رسالة جديدة', 'من 252633ملا: فيس\\س', 'message', 1, '2026-08-19 20:13:42', '16'),
('c71e2615-d062-4328-9b57-9de0f568bfa0', 'رسالة جديدة', 'من yesir neccar: سلرؤ', 'message', 1, '2026-08-19 00:53:16', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` varchar(36) NOT NULL,
  `title` text NOT NULL,
  `category` text NOT NULL,
  `description` text DEFAULT NULL,
  `city` text DEFAULT NULL,
  `duration` text DEFAULT NULL,
  `cover_image` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` text DEFAULT NULL,
  `all_images` text DEFAULT NULL,
  `materials` text DEFAULT NULL,
  `model_code` text DEFAULT NULL,
  `page_name` text DEFAULT NULL,
  `model_number` int(11) DEFAULT NULL,
  `price` text DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `title`, `category`, `description`, `city`, `duration`, `cover_image`, `created_at`, `status`, `all_images`, `materials`, `model_code`, `page_name`, `model_number`, `price`, `featured`) VALUES
('1f7fbad0-99af-11f1-99cd-74d02b02e0cb', 'ديكور ثلاثي الابعاد', 'dc', 'ديكور ثلاثي الابعاد مع اضاءة مخفية', 'انقرة', '5 ايام', 'images/3D1.png', '2026-08-16 20:14:45', 'منشور', '[\"images/3D1.png\"]', NULL, 'DC-1', 'dc', 1, '', 1),
('3a4d49d3-7e60-4fbf-b9fa-659493040fb7', 'ىياسس', 'kn', 'ننةتىاللبربرل', 'انقرة', '5 ايام', 'images/gypsum-design.png', '2026-08-19 20:27:36', 'منشور', NULL, 'خشب حديد قماش جلد سفنج عالي الجودة مضغوط', 'KN-1', 'kn', 1, '', 1),
('7448b072-d0ec-421c-bc7b-c6f42e532ae7', 'جبسم بورد', 'gb', 'ثلاثلافىغععععع', 'انقرة', '5 ايام', 'images/gypsum-design.png', '2026-08-19 19:26:33', 'منشور', NULL, 'خشب حديد قماش جلد سفنج عالي الجودة مضغوط', 'GB-1', 'gb', 1, '', 0),
('96fae7c3-2b99-462d-83e5-9551ca0bc0b0', 'dhjejwejw', 'gb', 'ndfhdhshghs', 'انقرة', '5 ايام', 'images/gypsum-design.png', '2026-08-19 19:30:55', 'منشور', NULL, 'خشب حديد قماش جلد سفنج عالي الجودة مضغوط', 'GB-2', 'gb', 2, '', 1),
('b362b053-a03c-463f-97a7-fc570e827eed', 'اطفال', 'kd', 'في معمل الشام الذهبي، نبتكر تصاميم غرف أطفال تجمع بين الأمان، الراحة، والجمال العصري. نحول أحلام أطفالكم إلى حقيقة من خلال أسرّة مبتكرة، خزانة مخصصة ذكية، وديكورات جدارية وأسقف جبسية ملونة ومضيئة تحفز إبداعهم وتمنحهم مساحة آمنة للعب والاسترخاء، مع استخدام أجود المواد الصحية والآمنة تماماً على سلامتهم.\"', 'انقرة', '5 ايام', 'images/kids-room.png', '2026-08-19 19:58:35', 'منشور', NULL, 'خشب حديد قماش جلد سفنج عالي الجودة مضغوط', 'KD-1', 'kd', 1, '', 0);

-- --------------------------------------------------------

--
-- Table structure for table `project_images`
--

CREATE TABLE `project_images` (
  `id` varchar(36) NOT NULL,
  `project_id` varchar(36) NOT NULL,
  `image_url` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` varchar(36) NOT NULL,
  `phone` text DEFAULT NULL,
  `whatsapp` text DEFAULT NULL,
  `email` text DEFAULT NULL,
  `facebook` text DEFAULT NULL,
  `instagram` text DEFAULT NULL,
  `tiktok` text DEFAULT NULL,
  `x` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `phone`, `whatsapp`, `email`, `facebook`, `instagram`, `tiktok`, `x`) VALUES
('1', '5394406251', '5394406251', '', '', '', '', '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bot_replies`
--
ALTER TABLE `bot_replies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `decorations`
--
ALTER TABLE `decorations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `images`
--
ALTER TABLE `images`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `project_images`
--
ALTER TABLE `project_images`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bot_replies`
--
ALTER TABLE `bot_replies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;
--
-- Database: `phpmyadmin`
--
CREATE DATABASE IF NOT EXISTS `phpmyadmin` DEFAULT CHARACTER SET utf8 COLLATE utf8_bin;
USE `phpmyadmin`;

-- --------------------------------------------------------

--
-- Table structure for table `pma__bookmark`
--

CREATE TABLE `pma__bookmark` (
  `id` int(10) UNSIGNED NOT NULL,
  `dbase` varchar(255) NOT NULL DEFAULT '',
  `user` varchar(255) NOT NULL DEFAULT '',
  `label` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `query` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Bookmarks';

-- --------------------------------------------------------

--
-- Table structure for table `pma__central_columns`
--

CREATE TABLE `pma__central_columns` (
  `db_name` varchar(64) NOT NULL,
  `col_name` varchar(64) NOT NULL,
  `col_type` varchar(64) NOT NULL,
  `col_length` text DEFAULT NULL,
  `col_collation` varchar(64) NOT NULL,
  `col_isNull` tinyint(1) NOT NULL,
  `col_extra` varchar(255) DEFAULT '',
  `col_default` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Central list of columns';

-- --------------------------------------------------------

--
-- Table structure for table `pma__column_info`
--

CREATE TABLE `pma__column_info` (
  `id` int(5) UNSIGNED NOT NULL,
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `column_name` varchar(64) NOT NULL DEFAULT '',
  `comment` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `mimetype` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `transformation` varchar(255) NOT NULL DEFAULT '',
  `transformation_options` varchar(255) NOT NULL DEFAULT '',
  `input_transformation` varchar(255) NOT NULL DEFAULT '',
  `input_transformation_options` varchar(255) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Column information for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__designer_settings`
--

CREATE TABLE `pma__designer_settings` (
  `username` varchar(64) NOT NULL,
  `settings_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Settings related to Designer';

-- --------------------------------------------------------

--
-- Table structure for table `pma__export_templates`
--

CREATE TABLE `pma__export_templates` (
  `id` int(5) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL,
  `export_type` varchar(10) NOT NULL,
  `template_name` varchar(64) NOT NULL,
  `template_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Saved export templates';

-- --------------------------------------------------------

--
-- Table structure for table `pma__favorite`
--

CREATE TABLE `pma__favorite` (
  `username` varchar(64) NOT NULL,
  `tables` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Favorite tables';

-- --------------------------------------------------------

--
-- Table structure for table `pma__history`
--

CREATE TABLE `pma__history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL DEFAULT '',
  `db` varchar(64) NOT NULL DEFAULT '',
  `table` varchar(64) NOT NULL DEFAULT '',
  `timevalue` timestamp NOT NULL DEFAULT current_timestamp(),
  `sqlquery` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='SQL history for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__navigationhiding`
--

CREATE TABLE `pma__navigationhiding` (
  `username` varchar(64) NOT NULL,
  `item_name` varchar(64) NOT NULL,
  `item_type` varchar(64) NOT NULL,
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Hidden items of navigation tree';

-- --------------------------------------------------------

--
-- Table structure for table `pma__pdf_pages`
--

CREATE TABLE `pma__pdf_pages` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `page_nr` int(10) UNSIGNED NOT NULL,
  `page_descr` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='PDF relation pages for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__recent`
--

CREATE TABLE `pma__recent` (
  `username` varchar(64) NOT NULL,
  `tables` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Recently accessed tables';

--
-- Dumping data for table `pma__recent`
--

INSERT INTO `pma__recent` (`username`, `tables`) VALUES
('root', '[{\"db\":\"baron_local_db\",\"table\":\"messages\"},{\"db\":\"baron_local_db\",\"table\":\"admins\"},{\"db\":\"baron_local_db\",\"table\":\"settings\"},{\"db\":\"baron_local_db\",\"table\":\"bot_replies\"},{\"db\":\"baron_local_db\",\"table\":\"projects\"}]');

-- --------------------------------------------------------

--
-- Table structure for table `pma__relation`
--

CREATE TABLE `pma__relation` (
  `master_db` varchar(64) NOT NULL DEFAULT '',
  `master_table` varchar(64) NOT NULL DEFAULT '',
  `master_field` varchar(64) NOT NULL DEFAULT '',
  `foreign_db` varchar(64) NOT NULL DEFAULT '',
  `foreign_table` varchar(64) NOT NULL DEFAULT '',
  `foreign_field` varchar(64) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Relation table';

-- --------------------------------------------------------

--
-- Table structure for table `pma__savedsearches`
--

CREATE TABLE `pma__savedsearches` (
  `id` int(5) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL DEFAULT '',
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `search_name` varchar(64) NOT NULL DEFAULT '',
  `search_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Saved searches';

-- --------------------------------------------------------

--
-- Table structure for table `pma__table_coords`
--

CREATE TABLE `pma__table_coords` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `pdf_page_number` int(11) NOT NULL DEFAULT 0,
  `x` float UNSIGNED NOT NULL DEFAULT 0,
  `y` float UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Table coordinates for phpMyAdmin PDF output';

-- --------------------------------------------------------

--
-- Table structure for table `pma__table_info`
--

CREATE TABLE `pma__table_info` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `display_field` varchar(64) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Table information for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__table_uiprefs`
--

CREATE TABLE `pma__table_uiprefs` (
  `username` varchar(64) NOT NULL,
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL,
  `prefs` text NOT NULL,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Tables'' UI preferences';

--
-- Dumping data for table `pma__table_uiprefs`
--

INSERT INTO `pma__table_uiprefs` (`username`, `db_name`, `table_name`, `prefs`, `last_update`) VALUES
('root', 'baron_local_db', 'settings', '{\"CREATE_TIME\":\"2026-08-16 02:34:29\",\"col_order\":[0,1,2,3,4,5,6,7],\"col_visib\":[1,1,1,1,1,1,1,1]}', '2026-08-16 21:40:24');

-- --------------------------------------------------------

--
-- Table structure for table `pma__tracking`
--

CREATE TABLE `pma__tracking` (
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL,
  `version` int(10) UNSIGNED NOT NULL,
  `date_created` datetime NOT NULL,
  `date_updated` datetime NOT NULL,
  `schema_snapshot` text NOT NULL,
  `schema_sql` text DEFAULT NULL,
  `data_sql` longtext DEFAULT NULL,
  `tracking` set('UPDATE','REPLACE','INSERT','DELETE','TRUNCATE','CREATE DATABASE','ALTER DATABASE','DROP DATABASE','CREATE TABLE','ALTER TABLE','RENAME TABLE','DROP TABLE','CREATE INDEX','DROP INDEX','CREATE VIEW','ALTER VIEW','DROP VIEW') DEFAULT NULL,
  `tracking_active` int(1) UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Database changes tracking for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__userconfig`
--

CREATE TABLE `pma__userconfig` (
  `username` varchar(64) NOT NULL,
  `timevalue` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `config_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='User preferences storage for phpMyAdmin';

--
-- Dumping data for table `pma__userconfig`
--

INSERT INTO `pma__userconfig` (`username`, `timevalue`, `config_data`) VALUES
('root', '2026-08-24 21:24:05', '{\"Console\\/Mode\":\"collapse\",\"Server\\/hide_db\":\"\",\"Server\\/only_db\":\"\"}');

-- --------------------------------------------------------

--
-- Table structure for table `pma__usergroups`
--

CREATE TABLE `pma__usergroups` (
  `usergroup` varchar(64) NOT NULL,
  `tab` varchar(64) NOT NULL,
  `allowed` enum('Y','N') NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='User groups with configured menu items';

-- --------------------------------------------------------

--
-- Table structure for table `pma__users`
--

CREATE TABLE `pma__users` (
  `username` varchar(64) NOT NULL,
  `usergroup` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Users and their assignments to user groups';

--
-- Indexes for dumped tables
--

--
-- Indexes for table `pma__bookmark`
--
ALTER TABLE `pma__bookmark`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pma__central_columns`
--
ALTER TABLE `pma__central_columns`
  ADD PRIMARY KEY (`db_name`,`col_name`);

--
-- Indexes for table `pma__column_info`
--
ALTER TABLE `pma__column_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `db_name` (`db_name`,`table_name`,`column_name`);

--
-- Indexes for table `pma__designer_settings`
--
ALTER TABLE `pma__designer_settings`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `pma__export_templates`
--
ALTER TABLE `pma__export_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `u_user_type_template` (`username`,`export_type`,`template_name`);

--
-- Indexes for table `pma__favorite`
--
ALTER TABLE `pma__favorite`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `pma__history`
--
ALTER TABLE `pma__history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `username` (`username`,`db`,`table`,`timevalue`);

--
-- Indexes for table `pma__navigationhiding`
--
ALTER TABLE `pma__navigationhiding`
  ADD PRIMARY KEY (`username`,`item_name`,`item_type`,`db_name`,`table_name`);

--
-- Indexes for table `pma__pdf_pages`
--
ALTER TABLE `pma__pdf_pages`
  ADD PRIMARY KEY (`page_nr`),
  ADD KEY `db_name` (`db_name`);

--
-- Indexes for table `pma__recent`
--
ALTER TABLE `pma__recent`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `pma__relation`
--
ALTER TABLE `pma__relation`
  ADD PRIMARY KEY (`master_db`,`master_table`,`master_field`),
  ADD KEY `foreign_field` (`foreign_db`,`foreign_table`);

--
-- Indexes for table `pma__savedsearches`
--
ALTER TABLE `pma__savedsearches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `u_savedsearches_username_dbname` (`username`,`db_name`,`search_name`);

--
-- Indexes for table `pma__table_coords`
--
ALTER TABLE `pma__table_coords`
  ADD PRIMARY KEY (`db_name`,`table_name`,`pdf_page_number`);

--
-- Indexes for table `pma__table_info`
--
ALTER TABLE `pma__table_info`
  ADD PRIMARY KEY (`db_name`,`table_name`);

--
-- Indexes for table `pma__table_uiprefs`
--
ALTER TABLE `pma__table_uiprefs`
  ADD PRIMARY KEY (`username`,`db_name`,`table_name`);

--
-- Indexes for table `pma__tracking`
--
ALTER TABLE `pma__tracking`
  ADD PRIMARY KEY (`db_name`,`table_name`,`version`);

--
-- Indexes for table `pma__userconfig`
--
ALTER TABLE `pma__userconfig`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `pma__usergroups`
--
ALTER TABLE `pma__usergroups`
  ADD PRIMARY KEY (`usergroup`,`tab`,`allowed`);

--
-- Indexes for table `pma__users`
--
ALTER TABLE `pma__users`
  ADD PRIMARY KEY (`username`,`usergroup`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `pma__bookmark`
--
ALTER TABLE `pma__bookmark`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__column_info`
--
ALTER TABLE `pma__column_info`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__export_templates`
--
ALTER TABLE `pma__export_templates`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__history`
--
ALTER TABLE `pma__history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__pdf_pages`
--
ALTER TABLE `pma__pdf_pages`
  MODIFY `page_nr` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__savedsearches`
--
ALTER TABLE `pma__savedsearches`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- Database: `test`
--
CREATE DATABASE IF NOT EXISTS `test` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `test`;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
