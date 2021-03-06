CREATE TABLE "SNAPSHOTS" (
  "ID" INTEGER NOT NULL GENERATED BY DEFAULT AS IDENTITY (START WITH 1, INCREMENT BY 1),
  "CREATED_AT" TIMESTAMP,
  "CREATED_AT_MS" BIGINT,
  "BUILD_DATE" TIMESTAMP,
  "BUILD_DATE_MS" BIGINT,
  "PROJECT_ID" INTEGER NOT NULL,
  "PERIOD1_DATE" TIMESTAMP,
  "PERIOD1_DATE_MS" BIGINT,
  "PERIOD2_DATE" TIMESTAMP,
  "PERIOD2_DATE_MS" BIGINT,
  "PERIOD3_DATE" TIMESTAMP,
  "PERIOD3_DATE_MS" BIGINT,
  "PERIOD4_DATE" TIMESTAMP,
  "PERIOD4_DATE_MS" BIGINT,
  "PERIOD5_DATE" TIMESTAMP,
  "PERIOD5_DATE_MS" BIGINT
);
