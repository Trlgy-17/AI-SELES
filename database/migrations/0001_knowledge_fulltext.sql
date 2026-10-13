-- Custom SQL migration: FULLTEXT index for knowledge retrieval (not expressible in drizzle schema)
ALTER TABLE `knowledge_documents` ADD FULLTEXT INDEX `knowledge_fulltext_idx` (`title`, `content`);
